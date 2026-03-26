"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookService = void 0;
const stripe_config_1 = require("../config/stripe.config");
const planLimits_1 = require("../constants/planLimits");
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const user_constants_1 = require("../constants/user.constants");
class StripeWebhookService {
    constructor(_subscriptionRepository, _planRepository, _userRepository, _paymentRepository, _jobAssignmentRepository, _walletRepository, _walletTransactionRepository, _revenueRepository, _sessionProvider) {
        this._subscriptionRepository = _subscriptionRepository;
        this._planRepository = _planRepository;
        this._userRepository = _userRepository;
        this._paymentRepository = _paymentRepository;
        this._jobAssignmentRepository = _jobAssignmentRepository;
        this._walletRepository = _walletRepository;
        this._walletTransactionRepository = _walletTransactionRepository;
        this._revenueRepository = _revenueRepository;
        this._sessionProvider = _sessionProvider;
    }
    ;
    async handleStripeEvent(event) {
        switch (event.type) {
            // Subscriptions 
            case "checkout.session.completed":
                await this._handleCheckoutCompleted(event.data.object);
                break;
            case "checkout.session.expired":
                await this._handleUpgradeCancel(event.data.object);
                break;
            case "customer.subscription.updated":
                await this._handleSubscriptionUpdated(event.data.object);
                break;
            case "customer.subscription.deleted":
                await this._handleSubscriptionDeleted(event.data.object);
                break;
            // case "invoice.paid":
            //     await this._handleUpgradeInvoice(
            //         event.data.object as Stripe.Invoice
            //     );
            //     break;
            // Milestones 
            case "payment_intent.succeeded":
                await this._handleMilestoneSuccess(event.data.object);
                break;
            case "payment_intent.payment_failed":
                await this._handleMilestoneFailed(event.data.object);
                break;
            case "payment_intent.canceled":
                await this._handleMilestoneCancelled(event.data.object);
                break;
        }
    }
    async _handleUpgradeCancel(session) {
        const isUpgrade = session.metadata?.isUpgrade === "true";
        if (!isUpgrade)
            return;
        const userId = session.metadata?.userId;
        if (!userId)
            return;
        await this._subscriptionRepository.updateOne({ userId, status: "active" }, {
            upgradeStatus: "none", //to rollback
            updatedAt: new Date(),
        });
    }
    async _handleUpgradeCheckout(session) {
        const userId = session.metadata?.userId;
        const upgradeTo = session.metadata?.upgradeTo;
        const billingInterval = session.metadata?.billingInterval;
        if (!userId || !upgradeTo || !billingInterval)
            return;
        const subscription = await this._subscriptionRepository.findOne({
            userId,
            status: "active",
        });
        if (!subscription)
            return;
        await this._subscriptionRepository.updateOne({ _id: subscription._id }, {
            planId: upgradeTo,
            billingInterval,
            upgradeStatus: "none",
            updatedAt: new Date(),
        });
        await this._applyPlanToUser(userId, upgradeTo);
    }
    async _handleCheckoutCompleted(session) {
        const isUpgrade = session.metadata?.isUpgrade === "true";
        if (isUpgrade) {
            await this._handleUpgradeCheckout(session);
            return;
        }
        if (!session.subscription || !session.invoice)
            return;
        const localSubscription = await this._subscriptionRepository.findOne({
            checkoutSessionId: session.id,
        });
        if (!localSubscription || localSubscription.status === "active")
            return;
        const invoice = await stripe_config_1.stripe.invoices.retrieve(session.invoice);
        const stripeSubscription = await stripe_config_1.stripe.subscriptions.retrieve(session.subscription);
        const subscriptionItem = stripeSubscription.items.data[0];
        if (!subscriptionItem)
            throw new Error('No items found in subscription');
        await this._subscriptionRepository.updateOne({ _id: localSubscription._id }, {
            status: "active",
            subscriptionId: stripeSubscription.id,
            startDate: new Date(subscriptionItem.current_period_start * 1000),
            expiryDate: new Date(subscriptionItem.current_period_end * 1000),
            updatedAt: new Date(),
        });
        if (invoice.status === "paid" && invoice.total > 0) {
            const providerPaymentId = invoice.id;
            const existingPayment = await this._paymentRepository.findOne({
                providerPaymentId,
            });
            if (!existingPayment) {
                const user = await this._userRepository.findById(localSubscription.userId.toString());
                if (!user)
                    throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
                const revenueSource = user.role === user_constants_1.UserRole.CLIENT ? user_constants_1.UserRole.CLIENT : user_constants_1.UserRole.FREELANCER;
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
        if (!plan)
            return;
        await this._userRepository.findByIdAndUpdate(localSubscription.userId.toString(), {
            subscription: localSubscription._id,
            isVerified: Boolean(plan.features.VerifiedBadge),
            limits: {
                invitesRemaining: plan.features.UnlimitedInvites ? 999999 : planLimits_1.PLAN_LIMITS.FREE.invites,
                proposalsRemaining: plan.features.UnlimitedProposals ? 999999 : planLimits_1.PLAN_LIMITS.FREE.proposals,
            },
        });
    }
    async _handleSubscriptionUpdated(stripeSub) {
        const localSubscription = await this._subscriptionRepository.findOne({
            subscriptionId: stripeSub.id,
        });
        if (!localSubscription)
            return;
        const item = stripeSub.items.data[0];
        if (!item)
            return;
        await this._subscriptionRepository.updateOne({ _id: localSubscription._id }, {
            expiryDate: new Date(item.current_period_end * 1000),
            autoRenew: !stripeSub.cancel_at_period_end,
            updatedAt: new Date(),
        });
    }
    async _handleSubscriptionDeleted(subscription) {
        const localSubscription = await this._subscriptionRepository.findOne({
            subscriptionId: subscription.id,
        });
        if (!localSubscription)
            return;
        await this._subscriptionRepository.updateOne({ _id: localSubscription._id }, {
            status: "cancelled",
            autoRenew: false,
            updatedAt: new Date(),
        });
        await this._userRepository.findByIdAndUpdate(localSubscription.userId.toString(), {
            isVerified: false,
            subscription: null,
            limits: {
                invitesRemaining: planLimits_1.PLAN_LIMITS.FREE.invites,
                proposalsRemaining: planLimits_1.PLAN_LIMITS.FREE.proposals,
            },
        });
    }
    // private async _handleUpgradeInvoice(invoice: Stripe.Invoice): Promise<void> {
    //     const reason = invoice.billing_reason;
    //     if (!reason) return;
    //     // Only handle upgrades
    //     if (!["subscription_update", "subscription_create"].includes(reason)) {
    //         return;
    //     }
    //     if (
    //         invoice.status !== "paid" ||
    //         invoice.amount_paid === 0
    //     ) {
    //         return;
    //     }
    //     if (invoice.amount_paid <= 0) {
    //         return;
    //     }
    //     const exists = await this._paymentRepository.findOne({
    //         providerPaymentId: invoice.id,
    //     });
    //     if (exists) return;
    //     const userId = invoice.metadata?.userId;
    //     const upgradeTo = invoice.metadata?.upgradeTo;
    //     const billingInterval = invoice.metadata?.billingInterval;
    //     if (!userId || !upgradeTo || !billingInterval) {
    //         return;
    //     }
    //     await this._paymentRepository.create({
    //         type: "subscription",
    //         status: "completed",
    //         amount: invoice.total / 100,
    //         currency: invoice.currency.toUpperCase(),
    //         provider: "stripe",
    //         method: "stripe",
    //         providerPaymentId: invoice.id,
    //         referenceId: invoice.id,
    //         userId,
    //         paymentDate: new Date(),
    //     });
    //     const subscription = await this._subscriptionRepository.findOne({
    //         userId,
    //         status: "active",
    //     });
    //     if (!subscription) return;
    //     await this._subscriptionRepository.updateOne(
    //         { _id: subscription._id },
    //         {
    //             planId: upgradeTo,
    //             billingInterval,
    //             upgradeStatus: "none",
    //             updatedAt: new Date(),
    //         }
    //     );
    //     await this._applyPlanToUser(userId, upgradeTo);
    // }
    async _applyPlanToUser(userId, planId) {
        const plan = await this._planRepository.findById(planId);
        if (!plan)
            return;
        await this._userRepository.findByIdAndUpdate(userId, {
            isVerified: Boolean(plan.features.VerifiedBadge),
            limits: {
                invitesRemaining: plan.features.UnlimitedInvites
                    ? 999999
                    : planLimits_1.PLAN_LIMITS.FREE.invites,
                proposalsRemaining: plan.features.UnlimitedProposals
                    ? 999999
                    : planLimits_1.PLAN_LIMITS.FREE.proposals,
            },
        });
    }
    async _handleMilestoneSuccess(intent) {
        if (intent.metadata?.purpose !== "milestone")
            return;
        const paymentId = intent.metadata.paymentId;
        const milestoneId = intent.metadata.milestoneId;
        const clientId = intent.metadata.clientId;
        if (!paymentId || !milestoneId || !clientId)
            return;
        const payment = await this._paymentRepository.findById(paymentId);
        if (!payment || payment.status === "completed")
            return;
        await this._sessionProvider.runInTransaction(async (session) => {
            payment.status = "completed";
            payment.paymentDate = new Date();
            payment.providerPaymentId = intent.id;
            await payment.save({ session });
            const clientWallet = await this._walletRepository.findOneWithSession({ userId: clientId, role: user_constants_1.UserRole.CLIENT, status: "active" }, session);
            if (!clientWallet)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Client wallet not found");
            clientWallet.balance.escrow += payment.amount;
            await clientWallet.save({ session });
            const assignment = await this._jobAssignmentRepository.findOneWithSession({ "milestones._id": milestoneId }, session);
            if (!assignment)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Assignment not found");
            const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
            if (!milestone)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Milestone not found");
            if (milestone.status !== "draft")
                return;
            await this._walletTransactionRepository.createWithSession({
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
            }, session);
            milestone.status = "funded";
            milestone.paymentId = payment._id;
            milestone.updatedAt = new Date();
            await assignment.save({ session });
        });
    }
    async _handleMilestoneFailed(intent) {
        if (intent.metadata?.purpose !== "milestone")
            return;
        const paymentId = intent.metadata.paymentId;
        if (!paymentId)
            return;
        await this._paymentRepository.updateOne({ _id: paymentId }, { status: "failed" });
    }
    async _handleMilestoneCancelled(intent) {
        if (intent.metadata?.purpose !== "milestone")
            return;
        const paymentId = intent.metadata.paymentId;
        if (!paymentId)
            return;
        await this._paymentRepository.updateOne({ _id: paymentId }, { status: "cancelled" });
    }
}
exports.StripeWebhookService = StripeWebhookService;
