import { ISubscription, ISubscriptionDocument } from "types/subscription.type";
import { ISubscriptionService } from "./interface/ISubscriptionService";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { getRazorpayInstance } from "config/razorpay.config";
import { SubscriptionDto } from "dtos/subscription.dto";
import { mapSubscription } from "mappers/subscription.mapper";
import { ISubscriptionRepository } from "repositories/interfaces/ISubscriptionRepository";
import { IPlanRepository } from "repositories/interfaces/IPlanRepository";
import crypto from 'crypto';
import { env } from "config/env.config";
import { IPaymentRepository } from "repositories/interfaces/IPaymentRepository";
import { IRevenueRepository } from "repositories/interfaces/IRevenueRepository";
import { HttpResponse } from "constants/responseMessage.constant";
import { PaginatedResult } from "types/pagination";
import { IUserRepository } from "repositories/interfaces/IUserRepository";
import { FilterQuery } from "mongoose";
import { IPlanDocument } from "types/plan.type";


export class SubscriptionService implements ISubscriptionService {
    constructor(
        private _subscriptionRepository: ISubscriptionRepository, private _planRepostory: IPlanRepository,
        private _userRepository: IUserRepository,private _paymentRepository: IPaymentRepository, 
        private _revenueRepository: IRevenueRepository
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

    async createSubscription(data: Partial<ISubscription> & { 
        userId: string; email: string; contact: string 
    }): Promise<ISubscriptionDocument>{

        const existing = await this._subscriptionRepository.findOne({ userId: data.userId, status: 'active' });

        if(existing) throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_ALREADY_ACTIVE);

        const plan = await this._planRepostory.findById(String(data.planId));
        if (!plan) throw createHttpError(HttpStatus.NOT_FOUND, "Selected plan not found");

        const lastSubscription = await this._subscriptionRepository.findOne(
            { userId: data.userId },
            { sort: { createdAt: -1 } } 
        )

        let razorpayCustomerId = lastSubscription?.customerId;

        const razorpay = getRazorpayInstance();
        // if there will be no customerId in the subscription collection
        if(!razorpayCustomerId){
            try {
                const newCustomer = await razorpay.customers.create({ email: data.email, contact: data.contact });
                razorpayCustomerId = newCustomer.id;
            } catch (error: unknown) {
                //ro check the error is because of user already exist
                if (
                    typeof error === 'object' &&
                    error !== null &&
                    'error' in error &&
                    (error as { error?: { description?: string } }).error?.description?.includes("Customer already exists")
                ) {
                    // taking a list of subscription to find the customerId
                    const customers = await razorpay.customers.all({ count: 50 });
                    const existing = customers.items.find(c => c.email === data.email);

                    if (existing) {
                        razorpayCustomerId = existing.id;
                    } else {
                        throw createHttpError(HttpStatus.NOT_FOUND, 'customer exists but ID not found');
                    }
                } else if (error instanceof Error) {
                    throw error;
                } else {
                    throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, 'Unknown error occurred');
                }
            }
        }

        const razorPlanId = data.billingInterval === "monthly"
            ? plan.razorPlanIdMonthly
            : plan.razorPlanIdYearly;

        if (!razorPlanId) throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Razorpay plan ID not configured");

        const razorSub = await (razorpay.subscriptions as any).create({
            plan_id: razorPlanId,
            customer_id: razorpayCustomerId,
            total_count: data.billingInterval === "monthly" ? 12 : 1,
            customer_notify: 1,
        });

        const startDate = new Date();
        const expiryDate = new Date(startDate);
        if (data.billingInterval === "monthly") {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        const subscription = await this._subscriptionRepository.create({
            userId: data.userId,
            planId: plan._id,
            startDate,
            expiryDate,
            billingInterval: data.billingInterval,
            autoRenew: true,
            status: "pending",
            gateway: "razorpay",
            customerId: razorpayCustomerId,
            subscriptionId: razorSub.id
        });
        await this._userRepository.findByIdAndUpdate(data.userId, { subscription: subscription._id });
        return subscription;
    }

    async verifyPayment({
        razorpay_subscription_id, razorpay_payment_id, razorpay_signature
    }: Record<string, string>): Promise<{ message: string }>{
        
        const razorpay = getRazorpayInstance();
        if (razorpay_signature) {
        const generatedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_SECRET as string)
            .update(razorpay_payment_id + "|" + razorpay_subscription_id)
            .digest("hex");

            if (generatedSignature !== razorpay_signature) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.PAYMENT_VERIFICATION_FAILED);
            }
        } else {
            const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);

            if (!subscription) {
                throw createHttpError(HttpStatus.NOT_FOUND, "Subscription not found on Razorpay");
            }

            if (!["active", "authenticated"].includes(subscription.status)) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Subscription not active yet");
            }
        }

        const subscription = await this._subscriptionRepository.updateOne(
            { subscriptionId: razorpay_subscription_id },
            { status: 'active', updatedAt: new Date() }
        );

        if (!subscription) throw createHttpError(HttpStatus.NOT_FOUND, "Local subscription not found");

        const subData = await this._subscriptionRepository.findOne({
            subscriptionId: razorpay_subscription_id,
        });

        if(!subData) throw createHttpError(HttpStatus.NOT_FOUND, "Subscription record missing after update");

        const plan = await this._planRepostory.findById(String(subData.planId));
        if(!plan) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PLAN_NOT_FOUND);

        const amount = subData.billingInterval === "monthly" ? plan.priceMonthly : plan.priceYearly;

        const paymentRecord = await this._paymentRepository.create({
            type: "subscription",
            status: "completed",
            amount,
            currency: plan.currency,
            provider: "razorpay",
            providerPaymentId: razorpay_payment_id ?? null,
            referenceId: razorpay_subscription_id,      
            userId: subData.userId,
            paymentDate: new Date(),
        });
          await this._revenueRepository.create({
            type: "subscription",
            source:"freelancer",
            amount,
            currency: plan.currency,
            referencePaymentId: paymentRecord._id,
            provider: "razorpay",
            providerPaymentId: razorpay_payment_id ?? null,
            status: "completed",
            gatewayFee: 0,
        });
  
        return { message: 'Subscription activated' };
    }

    async cancelSubscription(userId: string, subscriptionId: string): Promise<{ message: string; }> {
        const subscription = await this._subscriptionRepository.findOne({
            userId,
            subscriptionId
        });

        if(!subscription) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SUBSCRIPTION_NOT_FOUND);

        if(subscription.status !== 'active'){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.NO_ACTIVE_SUBSCRIPTION);
        }

        const razorpay = getRazorpayInstance();

        await razorpay.subscriptions.cancel(subscriptionId, false);
        
        await this._subscriptionRepository.updateOne(
            { subscriptionId },
            {
                status: 'cancelled',
                autoRenew: false,
                updatedAt: new Date()
            }
        );
        return { message: 'Subscription cancelled successfully' };
    }

    async getCurrentPlan(userId: string): Promise<SubscriptionDto>{
        const subscription = await this._subscriptionRepository.findOne({ userId });

        if (!subscription || subscription.status !== 'active') {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.NO_ACTIVE_SUBSCRIPTION);
        }
        return mapSubscription(subscription)
    }

    async getActiveFeatures(userId: string) {
        const subscription = await this._subscriptionRepository.findOneActiveByUser(userId);

        if (!subscription) return null;

        const plan = subscription.planId as any;

        return {
            planName: plan.planName,
            userType: plan.userType,
            features: plan.features,
            expiryDate: subscription.expiryDate,
        };
    }
}