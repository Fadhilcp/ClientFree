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



export class SubscriptionService implements ISubscriptionService {
    constructor(private subscriptionRepository: ISubscriptionRepository, private planRepostory: IPlanRepository) {}

    async createSubscription(data: ISubscription & { email: string; contact: string }): Promise<ISubscriptionDocument>{

        const existing = await this.subscriptionRepository.findOne({ userId: data.userId, status: 'active' });

        if(existing) {
            throw createHttpError(HttpStatus.CONFLICT, 'User already has an active Subscription');
        }

        const plan = await this.planRepostory.findById(String(data.planId));
        if (!plan) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Selected plan not found");
        }

        const razorpay = getRazorpayInstance();
        const customer = await razorpay.customers.create({ email: data.email, contact: data.contact });
        console.log("🚀 ~ SubscriptionService ~ createSubscription ~ customer:", customer)

        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        // const planId = getPlanId(data.planType, data.billingInterval);
        // const razorSub = await razorpay.subscriptions.create({
        //     plan_id: planId,
        //     customer_notify: 1,
        //     total_count: 12,
        //     // customer_id: customer.id
        // });

        const subscription = await this.subscriptionRepository.create({
            userId: data.userId,
            planId: plan._id,
            startDate,
            expiryDate,
            autoRenew: true,
            status: "active",
            gateway: "razorpay",
            customerId: customer.id,
        });
        return subscription;
    }

    async getCurrentPlan(userId: string): Promise<subscriptionDto>{
        const subscription = await this.subscriptionRepository.findOne({ userId });

        if (!subscription || subscription.status !== 'active') {
            throw createHttpError(HttpStatus.NOT_FOUND, 'No active subscription found');
        }
        return mapSubscription(subscription)
    }
}