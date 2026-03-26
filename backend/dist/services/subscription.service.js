"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const subscription_mapper_1 = require("../mappers/subscription.mapper");
const env_config_1 = require("../config/env.config");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const planLimits_1 = require("../constants/planLimits");
const stripe_config_1 = require("../config/stripe.config");
const userSubscriptions_mapper_1 = require("../mappers/userSubscriptions.mapper");
class SubscriptionService {
    constructor(_subscriptionRepository, _planRepository, _userRepository, _sessionProvider) {
        this._subscriptionRepository = _subscriptionRepository;
        this._planRepository = _planRepository;
        this._userRepository = _userRepository;
        this._sessionProvider = _sessionProvider;
    }
    async getAll(search, status, page = 1, limit = 10) {
        const filter = {};
        const normalizedStatus = status?.toLowerCase();
        if (status && ["pending", "active", "expired", "cancelled"].includes(normalizedStatus)) {
            filter.status = normalizedStatus;
        }
        if (search) {
            filter.$or = [
                { subscriptionId: { $regex: search, $options: "i" } },
                { gateway: { $regex: search, $options: "i" } },
            ];
        }
        const result = await this._subscriptionRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(subscription_mapper_1.mapSubscription)
        };
    }
    async createSubscription(data) {
        const existing = await this._subscriptionRepository.findOne({ userId: data.userId, status: "active" });
        if (existing)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, responseMessage_constant_1.HttpResponse.USER_ALREADY_ACTIVE);
        const plan = await this._planRepository.findById(String(data.planId));
        if (!plan || !plan.active)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Plan not available");
        let stripeCustomerId;
        const lastSubscription = await this._subscriptionRepository.findOne({ userId: data.userId }, { sort: { createdAt: -1 } });
        stripeCustomerId = lastSubscription?.customerId;
        if (!stripeCustomerId) {
            const customer = await stripe_config_1.stripe.customers.create({
                email: data.email,
                metadata: { userId: data.userId },
            });
            stripeCustomerId = customer.id;
        }
        await stripe_config_1.stripe.customers.update(stripeCustomerId, { balance: 0 });
        const priceId = data.billingInterval === "monthly" ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;
        if (!priceId || !priceId.startsWith("price_"))
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR, "Stripe price ID not configured");
        // stripe checkout session params
        const params = {
            mode: "subscription",
            customer: stripeCustomerId,
            line_items: [{ price: priceId.toString(), quantity: 1 }],
            success_url: `${env_config_1.env.FRONTEND_URL}/billing/success`,
            cancel_url: `${env_config_1.env.FRONTEND_URL}/billing/cancel`,
            metadata: {
                userId: data.userId,
                planId: plan._id.toString(),
                billingInterval: data.billingInterval ?? "unknown",
            },
        };
        const session = await stripe_config_1.stripe.checkout.sessions.create(params);
        await this._subscriptionRepository.create({
            userId: data.userId,
            planId: plan._id,
            billingInterval: data.billingInterval,
            status: "pending",
            gateway: "stripe",
            customerId: stripeCustomerId,
            checkoutSessionId: session.id,
        });
        return { checkoutUrl: session.url };
    }
    async upgradeSubscription(userId, planId, billingInterval) {
        const activeSub = await this._subscriptionRepository.findOne({
            userId,
            status: "active",
        });
        if (!activeSub)
            throw (0, httpError_util_1.createHttpError)(404, "No active subscription");
        const newPlan = await this._planRepository.findById(planId);
        if (!newPlan || !newPlan.active) {
            throw (0, httpError_util_1.createHttpError)(404, "Plan not available");
        }
        const isSamePlan = String(activeSub.planId) === String(newPlan._id);
        const isSameInterval = activeSub.billingInterval === billingInterval;
        if (isSamePlan && isSameInterval) {
            throw (0, httpError_util_1.createHttpError)(400, "Already on this plan");
        }
        const amount = billingInterval === "monthly"
            ? newPlan.priceMonthly
            : newPlan.priceYearly;
        const MIN_AMOUNT_INR = 50;
        if (amount < MIN_AMOUNT_INR) {
            throw (0, httpError_util_1.createHttpError)(400, `Minimum charge must be at least ₹${MIN_AMOUNT_INR}`);
        }
        const session = await stripe_config_1.stripe.checkout.sessions.create({
            mode: "payment",
            customer: activeSub.customerId,
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `Upgrade to ${newPlan.planName}`,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${env_config_1.env.FRONTEND_URL}/billing/success`,
            cancel_url: `${env_config_1.env.FRONTEND_URL}/billing/cancel`,
            metadata: {
                userId,
                upgradeTo: newPlan._id.toString(),
                billingInterval,
                isUpgrade: "true",
            },
        });
        await this._subscriptionRepository.updateOne({ _id: activeSub._id }, {
            upgradeStatus: "pending",
        });
        return { paymentUrl: session.url };
    }
    async cancelSubscription(userId) {
        const subscription = await this._subscriptionRepository.findOne({
            userId,
            gateway: "stripe",
            status: "active",
        });
        if (!subscription || !subscription.subscriptionId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.SUBSCRIPTION_NOT_FOUND);
        }
        ;
        await stripe_config_1.stripe.subscriptions.cancel(subscription.subscriptionId);
        await this._subscriptionRepository.updateOne({ _id: subscription._id }, {
            status: "cancelled",
            autoRenew: false,
            updatedAt: new Date(),
        });
        await this._userRepository.findByIdAndUpdate(userId, {
            isVerified: false,
            subscription: null,
            limits: {
                invitesRemaining: planLimits_1.PLAN_LIMITS.FREE.invites,
                proposalsRemaining: planLimits_1.PLAN_LIMITS.FREE.proposals,
            }
        });
        return { message: "Subscription cancelled successfully" };
    }
    async getCurrentPlan(userId) {
        const subscription = await this._subscriptionRepository.findOne({ userId });
        if (!subscription || subscription.status !== 'active') {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.NO_ACTIVE_SUBSCRIPTION);
        }
        return (0, subscription_mapper_1.mapSubscription)(subscription);
    }
    async getActiveFeatures(userId) {
        const subscription = await this._subscriptionRepository.findOneActiveByUser(userId);
        if (!subscription)
            return null;
        const plan = subscription.planId;
        return {
            planId: plan._id.toString(),
            subscriptionId: subscription._id.toString(),
            planName: plan.planName,
            userType: plan.userType,
            features: plan.features,
            status: subscription.status,
            upgradeStatus: subscription.upgradeStatus,
            expiryDate: subscription.expiryDate,
            billingInterval: subscription.billingInterval,
        };
    }
    async expireSubscriptions() {
        const expiredSubs = await this._subscriptionRepository.findExpiredActive();
        if (!expiredSubs.length)
            return 0;
        for (const sub of expiredSubs) {
            await this._sessionProvider.runInTransaction(async (session) => {
                // expire subscription
                await this._subscriptionRepository.expireById(sub._id.toString(), session);
                // reset user limits
                await this._userRepository.resetSubscriptionState(sub.userId.toString(), {
                    invitesRemaining: planLimits_1.PLAN_LIMITS.FREE.invites,
                    proposalsRemaining: planLimits_1.PLAN_LIMITS.FREE.proposals,
                }, session);
            });
        }
        return expiredSubs.length;
    }
    async getMySubscriptions(userId, page, limit) {
        const result = await this._subscriptionRepository.paginate({ userId }, {
            page, limit, sort: { createdAt: -1 },
            populate: {
                path: "planId",
                select: "planName userType priceMonthly priceYearly features",
            },
        });
        console.log("🚀 ~ SubscriptionService ~ getMySubscriptions ~ result:", result);
        return {
            ...result,
            data: result.data.map(userSubscriptions_mapper_1.mapUserSubscriptions),
        };
    }
}
exports.SubscriptionService = SubscriptionService;
