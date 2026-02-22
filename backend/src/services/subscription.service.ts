import { ISubscription, ISubscriptionDocument } from "../types/subscription.type";
import { ISubscriptionService } from "./interface/ISubscriptionService";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { getActiveFeaturesDto, SubscriptionDto } from "../dtos/subscription.dto";
import { mapSubscription } from "../mappers/subscription.mapper";
import { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository";
import { IPlanRepository } from "../repositories/interfaces/IPlanRepository";
import { env } from "../config/env.config";
import { HttpResponse } from "../constants/responseMessage.constant";
import { PaginatedResult } from "../types/pagination";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { ClientSession, FilterQuery } from "mongoose";
import { IDatabaseSessionProvider } from "../repositories/db/session-provider.interface";
import { PLAN_LIMITS } from "../constants/planLimits";
import { stripe } from "../config/stripe.config";
import Stripe from "stripe";
import { mapUserSubscriptions } from "../mappers/userSubscriptions.mapper";
import { UserSubscriptionsDTO } from "../dtos/userSubscriptions.dto";

export class SubscriptionService implements ISubscriptionService {
    constructor(
        private _subscriptionRepository: ISubscriptionRepository, private _planRepository: IPlanRepository,
        private _userRepository: IUserRepository, private _sessionProvider: IDatabaseSessionProvider
    ) {}

    async getAll(search: string, status: string, page=1, limit=10): Promise<PaginatedResult<SubscriptionDto>> {
        const filter: FilterQuery<ISubscriptionDocument> = {}

        const normalizedStatus = status?.toLowerCase();
        if(status && ["pending","active", "expired", "cancelled"].includes(normalizedStatus)){
            filter.status = normalizedStatus;
        }

        if(search){
            filter.$or = [
                { subscriptionId: { $regex: search, $options: "i" } },
                { gateway: { $regex: search, $options: "i" } },
            ]
        }

        const result = await this._subscriptionRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });

        return {
            ...result,
            data: result.data.map(mapSubscription)
        };
    }

    async createSubscription(data: Partial<ISubscription> & { userId: string, email: string; contact: string; }): Promise<{ checkoutUrl: string }> {
        
        const existing = await this._subscriptionRepository.findOne({ userId: data.userId, status: "active" });

        if(existing) throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_ALREADY_ACTIVE);

        const plan = await this._planRepository.findById(String(data.planId));

        if (!plan || !plan.active) throw createHttpError(HttpStatus.NOT_FOUND, "Plan not available");

        let stripeCustomerId: string | undefined;

        const lastSubscription = await this._subscriptionRepository.findOne(
            { userId: data.userId },
            { sort: { createdAt: -1 } }
        );

        stripeCustomerId = lastSubscription?.customerId;

        if(!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: data.email,
                metadata: { userId: data.userId },
            });
            stripeCustomerId = customer.id;
        }

        await stripe.customers.update(stripeCustomerId, { balance: 0 });

        const priceId = data.billingInterval === "monthly" ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;

        if(!priceId || !priceId.startsWith("price_")) throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Stripe price ID not configured");
        // stripe checkout session params
        const params: Stripe.Checkout.SessionCreateParams = {
            mode: "subscription",
            customer: stripeCustomerId,
            line_items: [{ price: priceId.toString(), quantity: 1 }],
            success_url: `${env.FRONTEND_URL}/billing/success`,
            cancel_url: `${env.FRONTEND_URL}/billing/cancel`,
            metadata: {
                userId: data.userId,
                planId: plan._id.toString(),
                billingInterval: data.billingInterval ?? "unknown",
            },
        };

        const session = await stripe.checkout.sessions.create(params);

        await this._subscriptionRepository.create({
            userId: data.userId,
            planId: plan._id,
            billingInterval: data.billingInterval,
            status: "pending",
            gateway: "stripe",
            customerId: stripeCustomerId,
            checkoutSessionId: session.id,
        });

        return { checkoutUrl: session.url! };
    }

    async upgradeSubscription(userId: string, planId: string, billingInterval: "monthly" | "yearly")
    : Promise<{ paymentUrl?: string }> {

        const activeSub = await this._subscriptionRepository.findOne({
            userId: userId,
            status: "active",
        });

        if (!activeSub)
            throw createHttpError(404, "No active subscription");

        const newPlan = await this._planRepository.findById(planId);
        if (!newPlan || !newPlan.active)
            throw createHttpError(404, "Plan not available");

        // Prevent same plan upgrade
        const isSamePlan =
            String(activeSub.planId) === String(newPlan._id);

            const isSameInterval =
            activeSub.billingInterval === billingInterval;

        if (isSamePlan && isSameInterval) {
            throw createHttpError(
                400,
                "Already on this plan with the same billing interval"
            );
        }

        if(!activeSub.subscriptionId) return {};

        const stripeSub = await stripe.subscriptions.retrieve(
            activeSub.subscriptionId
        );

        const item = stripeSub.items.data[0];
        if (!item) throw new Error("Stripe subscription item missing");

        const newPriceId =
            billingInterval === "monthly"
                ? newPlan.stripePriceIdMonthly
                : newPlan.stripePriceIdYearly;

        if (!newPriceId?.startsWith("price_"))
            throw createHttpError(500, "Stripe price ID not configured");

        const updated = await stripe.subscriptions.update(stripeSub.id, {
            items: [{ id: item.id, price: newPriceId }],
            proration_behavior: "create_prorations",
            payment_behavior: "pending_if_incomplete",
            expand: ["latest_invoice"],
        });

        const invoice = updated.latest_invoice as Stripe.Invoice | null;
        
        if (!invoice) return {};

        await stripe.invoices.update(invoice.id, {
            metadata: {
                upgradeFrom: activeSub.planId.toString(),
                upgradeTo: newPlan._id.toString(),
                userId,
                billingInterval: billingInterval,
            },
        });

        if (invoice.status !== "paid") {
            return {
                paymentUrl: invoice.hosted_invoice_url ?? undefined,
            };
        }
        return {};
    }

    async cancelSubscription(userId: string): Promise<{ message: string; }> {
        
        const subscription = await this._subscriptionRepository.findOne({
            userId,
            gateway: "stripe",
            status: "active",
        });

        if(!subscription || !subscription.subscriptionId) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SUBSCRIPTION_NOT_FOUND);
        };

        await stripe.subscriptions.cancel(subscription.subscriptionId);

        await this._subscriptionRepository.updateOne(
            { _id: subscription._id },
            {
                status: "cancelled",
                autoRenew: false,
                updatedAt: new Date(),
            }
        );

        await this._userRepository.findByIdAndUpdate( userId, {
            isVerified: false,
            subscription: null,
            limits: {
                invitesRemaining: PLAN_LIMITS.FREE.invites,
                proposalsRemaining: PLAN_LIMITS.FREE.proposals,
            }
        });

        return { message: "Subscription cancelled successfully" };
    }

    async getCurrentPlan(userId: string): Promise<SubscriptionDto>{
        const subscription = await this._subscriptionRepository.findOne({ userId });

        if (!subscription || subscription.status !== 'active') {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.NO_ACTIVE_SUBSCRIPTION);
        }
        return mapSubscription(subscription)
    }

    async getActiveFeatures(userId: string): Promise<getActiveFeaturesDto | null> {
        
        const subscription = await this._subscriptionRepository.findOneActiveByUser(userId);

        if (!subscription) return null;

        const plan = subscription.planId;

        return {
            planId: plan._id.toString(),
            subscriptionId: subscription._id.toString(),
            planName: plan.planName,
            userType: plan.userType,
            features: plan.features,
            expiryDate: subscription.expiryDate,
            billingInterval: subscription.billingInterval,
        };
    }

    async expireSubscriptions(): Promise<number> {
        const expiredSubs = await this._subscriptionRepository.findExpiredActive();

        if (!expiredSubs.length) return 0;

        for (const sub of expiredSubs) {
            await this._sessionProvider.runInTransaction(
                async (session: ClientSession) => {

                    // expire subscription
                    await this._subscriptionRepository.expireById(
                        sub._id.toString(),
                        session
                    );
                    // reset user limits
                    await this._userRepository.resetSubscriptionState(
                        sub.userId.toString(),
                        {
                            invitesRemaining: PLAN_LIMITS.FREE.invites,
                            proposalsRemaining: PLAN_LIMITS.FREE.proposals,
                        },
                        session
                    );
                }
            );
        }

        return expiredSubs.length;
    }

    async getMySubscriptions(userId: string, page: number, limit: number): Promise<PaginatedResult<UserSubscriptionsDTO>> {
        
        const result = await this._subscriptionRepository.paginate(
            { userId },
            {
                page, limit, sort: { createdAt: -1 },
                populate: {
                    path: "planId",
                    select: "planName userType priceMonthly priceYearly features",
                },
            }
        );

        return {
            ...result,
            data: result.data.map(mapUserSubscriptions),
        };
    }
}