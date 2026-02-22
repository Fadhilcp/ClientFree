import { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository";
import { IStripeWebhookService } from "./interface/IStripeWebhookService";
import { IPlanRepository } from "../repositories/interfaces/IPlanRepository";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import Stripe from "stripe";
import { stripe } from "../config/stripe.config";
import { PLAN_LIMITS } from "../constants/planLimits";
import { IPaymentRepository } from "../repositories/interfaces/IPaymentRepository";
import { IJobAssignmentRepository } from "../repositories/interfaces/IJobAssignmentRepository";
import { IDatabaseSessionProvider } from "../repositories/db/session-provider.interface";
import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { IWalletTransactionRepository } from "../repositories/interfaces/IWalletTransactionRepository";
import { IRevenueRepository } from "../repositories/interfaces/IRevenueRepository";
import { HttpResponse } from "../constants/responseMessage.constant";
import { UserRole } from "../constants/user.constants";

export class StripeWebhookService implements IStripeWebhookService {

    constructor(
        private _subscriptionRepository: ISubscriptionRepository,
        private _planRepository: IPlanRepository,
        private _userRepository: IUserRepository,
        private _paymentRepository: IPaymentRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _walletRepository: IWalletRepository,
        private _walletTransactionRepository: IWalletTransactionRepository,
        private _revenueRepository: IRevenueRepository,
        private _sessionProvider: IDatabaseSessionProvider,
    ){};

    async handleStripeEvent(event: Stripe.Event): Promise<void> {
        
        switch(event.type) {
            // Subscriptions 
            case "checkout.session.completed": 
                await this._handleCheckoutCompleted(
                    event.data.object as Stripe.Checkout.Session
                );
                break;

            case "customer.subscription.updated":
                await this._handleSubscriptionUpdated(
                    event.data.object as Stripe.Subscription
                );
                break;
            
            case "customer.subscription.deleted":
                await this._handleSubscriptionDeleted(
                    event.data.object as Stripe.Subscription
                );
                break;

            case "invoice.paid":
                await this._handleUpgradeInvoice(
                    event.data.object as Stripe.Invoice
                );
                break;

            // Milestones 
            case "payment_intent.succeeded": 
                await this._handleMilestoneSuccess(
                    event.data.object as Stripe.PaymentIntent
                );
                break;

            case "payment_intent.payment_failed": 
                await this._handleMilestoneFailed(
                    event.data.object as Stripe.PaymentIntent
                );
                break;

            case "payment_intent.canceled": 
                await this._handleMilestoneCancelled(
                    event.data.object as Stripe.PaymentIntent
                );
                break;

        }
    }

    private async _handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
        if (!session.subscription || !session.invoice) return;

        const localSubscription = await this._subscriptionRepository.findOne({
            checkoutSessionId: session.id,
        });

        if (!localSubscription || localSubscription.status === "active") return;

        const invoice = await stripe.invoices.retrieve(session.invoice as string);

        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

        const subscriptionItem = stripeSubscription.items.data[0];

        if (!subscriptionItem) throw new Error('No items found in subscription');

        await this._subscriptionRepository.updateOne(
            { _id: localSubscription._id },
            {
                status: "active",
                subscriptionId: stripeSubscription.id,
                startDate: new Date(subscriptionItem.current_period_start * 1000),
                expiryDate: new Date(subscriptionItem.current_period_end * 1000),
                updatedAt: new Date(),
            }
        );

        if(invoice.status === "paid" && invoice.total > 0) {
            
            const providerPaymentId = invoice.id;
        
            const existingPayment = await this._paymentRepository.findOne({
                providerPaymentId,
            });
        
            if (!existingPayment) {

                const user = await this._userRepository.findById(localSubscription.userId.toString());
                if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

                const revenueSource = user.role === UserRole.CLIENT ? UserRole.CLIENT : UserRole.FREELANCER;

                const paymentDate = invoice.status_transitions.paid_at
                    ? new Date(invoice.status_transitions.paid_at * 1000)
                    : new Date();

                const amount = invoice.total / 100;
        
                const payment = await this._paymentRepository.create({
                    type: "subscription",
                    status: "completed",
                    amount,
                    currency: invoice.currency.toUpperCase(),
                    provider: "stripe",
                    method: "stripe",
                    providerPaymentId,
                    referenceId: invoice.id,
                    userId: localSubscription.userId,
                    paymentDate,
                });
        
                await this._revenueRepository.create({
                    type: "subscription",
                    source: revenueSource, // freelancer / client
                    amount: payment.amount,
                    currency: payment.currency,
                    provider: "stripe",
                    providerPaymentId,
                    referencePaymentId: payment._id,
                    gatewayFee: 0,
                    status: "completed",
                });
            }
        }

        const plan = await this._planRepository.findById(localSubscription.planId.toString());
        if (!plan) return;

        await this._userRepository.findByIdAndUpdate(localSubscription.userId.toString(), {
            subscription: localSubscription._id,
            isVerified: Boolean(plan.features.VerifiedBadge),
            limits: {
                invitesRemaining: plan.features.UnlimitedInvites ? 999999 : PLAN_LIMITS.FREE.invites,
                proposalsRemaining: plan.features.UnlimitedProposals ? 999999 : PLAN_LIMITS.FREE.proposals,
            },
        });
    }

    private async _handleSubscriptionUpdated(stripeSub: Stripe.Subscription): Promise<void> {
        const localSubscription = await this._subscriptionRepository.findOne({
            subscriptionId: stripeSub.id,
        });
        if (!localSubscription) return;

        const item = stripeSub.items.data[0];
        if (!item?.price) return;

        const priceId = item.price.id;
        const interval = item.price.recurring?.interval; // "month" | "year"

        if (!interval) return;

        const billingInterval =
            interval === "month" ? "monthly" : "yearly";

        const plan = await this._planRepository.findOne({
            $or: [
                { stripePriceIdMonthly: priceId },
                { stripePriceIdYearly: priceId },
            ],
        });

        if (!plan) {
            return;
        }

        const planChanged =
            String(localSubscription.planId) !== String(plan._id);

        const intervalChanged =
            localSubscription.billingInterval !== billingInterval;

        await this._subscriptionRepository.updateOne(
            { _id: localSubscription._id },
            {
                planId: plan._id,
                billingInterval,
                expiryDate: new Date(item.current_period_end * 1000),
                autoRenew: !stripeSub.cancel_at_period_end,
                updatedAt: new Date(),
            }
        );

        if (planChanged || intervalChanged) {
            await this._applyPlanToUser(
            localSubscription.userId.toString(),
            plan._id.toString()
            );
        }
    }

    private async _handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {

        const localSubscription = await this._subscriptionRepository.findOne({
            subscriptionId: subscription.id,
        });

        if (!localSubscription) return;

        await this._subscriptionRepository.updateOne(
            { _id: localSubscription._id },
            {
                status: "cancelled",
                autoRenew: false,
                updatedAt: new Date(),
            }
        );

        await this._userRepository.findByIdAndUpdate(localSubscription.userId.toString(), {
            isVerified: false,
            subscription: null,
            limits: {
                invitesRemaining: PLAN_LIMITS.FREE.invites,
                proposalsRemaining: PLAN_LIMITS.FREE.proposals,
            },
        });
    }

    private async _handleUpgradeInvoice(invoice: Stripe.Invoice): Promise<void> {
        if (invoice.billing_reason !== "subscription_update") return;
        if (invoice.status !== "paid") return;

        const exists = await this._paymentRepository.findOne({
            providerPaymentId: invoice.id,
        });

        if (exists) return;

        await this._paymentRepository.create({
            type: "subscription",
            status: "completed",
            amount: invoice.total / 100,
            currency: invoice.currency.toUpperCase(),
            provider: "stripe",
            method: "stripe",
            providerPaymentId: invoice.id,
            referenceId: invoice.id,
            userId: invoice.metadata?.userId,
            paymentDate: new Date(),
        });
    }

    private async _applyPlanToUser(userId: string, planId: string) {

        const plan = await this._planRepository.findById(planId);
        if (!plan) return;

        await this._userRepository.findByIdAndUpdate(userId, {
            isVerified: Boolean(plan.features.VerifiedBadge),
            limits: {
            invitesRemaining: plan.features.UnlimitedInvites
                ? 999999
                : PLAN_LIMITS.FREE.invites,
            proposalsRemaining: plan.features.UnlimitedProposals
                ? 999999
                : PLAN_LIMITS.FREE.proposals,
            },
        });
    }



    private async _handleMilestoneSuccess(intent: Stripe.PaymentIntent): Promise<void> {
        
        if(intent.metadata?.purpose !== "milestone") return;

        const paymentId = intent.metadata.paymentId;
        const milestoneId = intent.metadata.milestoneId;
        const clientId = intent.metadata.clientId;

        if(!paymentId || !milestoneId || !clientId) return;

        const payment = await this._paymentRepository.findById(paymentId);
        if(!payment || payment.status === "completed") return;

        await this._sessionProvider.runInTransaction(async (session) => {

            payment.status = "completed";
            payment.paymentDate = new Date();
            payment.providerPaymentId = intent.id;
            await payment.save({ session });

            const clientWallet = await this._walletRepository.findOneWithSession(
                { userId: clientId, role: UserRole.CLIENT, status: "active" },
                session
            );

            if(!clientWallet) throw createHttpError(HttpStatus.BAD_REQUEST, "Client wallet not found");

            clientWallet.balance.escrow += payment.amount;
            await clientWallet.save({ session });

            const assignment = await this._jobAssignmentRepository.findOneWithSession(
                { "milestones._id": milestoneId },
                session
            );

            if (!assignment) throw createHttpError(HttpStatus.NOT_FOUND, "Assignment not found");

            const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);

            if (!milestone) throw createHttpError(HttpStatus.NOT_FOUND, "Milestone not found");

            if (milestone.status !== "draft") return;

            await this._walletTransactionRepository.createWithSession(
                {
                    walletId: clientWallet._id,
                    userId: clientWallet.userId,
                    jobAssignmentId: assignment._id,
                    milestoneId: milestone._id,
                    paymentId: payment._id,
                    type: "escrow_hold",
                    direction: "credit",
                    amount: payment.amount,
                    balanceAfter: {
                        available: clientWallet.balance.available,
                        escrow: clientWallet.balance.escrow,
                        pending: clientWallet.balance.pending,
                    },
                },
                session
            );

            milestone.status = "funded";
            milestone.paymentId = payment._id;
            milestone.updatedAt = new Date();

            await assignment.save({ session });
        });
    }

    private async _handleMilestoneFailed(intent: Stripe.PaymentIntent): Promise<void> {

        if(intent.metadata?.purpose !== "milestone") return;

        const paymentId = intent.metadata.paymentId;
        if(!paymentId) return;

        await this._paymentRepository.updateOne(
            { _id: paymentId },
            { status: "failed" },
        );
    }

    private async _handleMilestoneCancelled(intent: Stripe.PaymentIntent): Promise<void> {

        if(intent.metadata?.purpose !== "milestone") return;

        const paymentId = intent.metadata.paymentId;
        if(!paymentId) return;

        await this._paymentRepository.updateOne(
            { _id: paymentId },
            { status: "cancelled" },
        );
    }
}