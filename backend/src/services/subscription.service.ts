import { ISubscription, ISubscriptionDocument } from "types/subscription.type";
import { ISubscriptionService } from "./interface/ISubscriptionService";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { getRazorpayInstance } from "config/razorpay.config";
import { subscriptionDto } from "dtos/subscription.dto";
import { mapSubscription } from "mappers/subscription.mapper";
// import { getPlanId } from "utils/plan.util";
import { ISubscriptionRepository } from "repositories/interfaces/ISubscriptionRepository";
import { IPlanRepository } from "repositories/interfaces/IPlanRepository";
import crypto from 'crypto';
import { env } from "config/env.config";


export class SubscriptionService implements ISubscriptionService {
    constructor(private subscriptionRepository: ISubscriptionRepository, private planRepostory: IPlanRepository) {}

    async createSubscription(data: Partial<ISubscription> & { email: string; contact: string })
    : Promise<ISubscriptionDocument>{

        const existing = await this.subscriptionRepository.findOne({ userId: data.userId, status: 'active' });

        if(existing) throw createHttpError(HttpStatus.CONFLICT, 'User already has an active Subscription');

        const plan = await this.planRepostory.findById(String(data.planId));
        if (!plan) throw createHttpError(HttpStatus.NOT_FOUND, "Selected plan not found");

        const lastSubscription = await this.subscriptionRepository.findOne(
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
            } catch (error: any) {
                if (error.error?.description?.includes("Customer already exists")) {
                    // taking a list of subscription to find the customerId
                    const customers = await razorpay.customers.all({ count: 50 });
                    const existing = customers.items.find(c => c.email === data.email);

                    if (existing) {
                        razorpayCustomerId = existing.id;
                    } else {
                        throw createHttpError(HttpStatus.NOT_FOUND, 'customer exists but ID not found');
                    }
                } else {
                    throw error;
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
        data.billingInterval === "monthly"
            ? expiryDate.setMonth(expiryDate.getMonth() + 1)
            : expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const subscription = await this.subscriptionRepository.create({
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
                throw createHttpError(HttpStatus.UNAUTHORIZED, "Payment verification failed");
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

        const updated = await this.subscriptionRepository.updateOne(
            { subscriptionId: razorpay_subscription_id },
            { 
                status: 'active', 
                updatedAt: new Date(),
            }
        );

        if (!updated) throw createHttpError(HttpStatus.NOT_FOUND, "Subscription not found in database");
  
        return { message: 'Subscription activated' };
    }

    async cancelSubscription(userId: string, subscriptionId: string): Promise<{ message: string; }> {
        const subscription = await this.subscriptionRepository.findOne({
            userId,
            subscriptionId
        });

        if(!subscription) throw createHttpError(HttpStatus.NOT_FOUND, 'Subscription not found');

        if(subscription.status !== 'active'){
            throw createHttpError(HttpStatus.BAD_REQUEST, 'Subscription is not active');
        }

        const razorpay = getRazorpayInstance();

        await razorpay.subscriptions.cancel(subscriptionId, false);
        
        await this.subscriptionRepository.updateOne(
            { subscriptionId },
            {
                status: 'cancelled',
                autoRenew: false,
                updatedAt: new Date()
            }
        );
        return { message: 'Subscription cancelled successfully' };
    }

    async getCurrentPlan(userId: string): Promise<subscriptionDto>{
        const subscription = await this.subscriptionRepository.findOne({ userId });

        if (!subscription || subscription.status !== 'active') {
            throw createHttpError(HttpStatus.NOT_FOUND, 'No active subscription found');
        }
        return mapSubscription(subscription)
    }
}