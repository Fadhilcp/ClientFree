import { subscriptionDto } from "dtos/subscription.dto";
import { ISubscription, ISubscriptionDocument } from "types/subscription.type";


export interface ISubscriptionService {
    createSubscription(data: Partial<ISubscription> & { email: string; contact: string }): Promise<ISubscriptionDocument>;
    verifyPayment({}: Record<string, string>): Promise<{ message: string }>;
    cancelSubscription(userId: string, subscriptionId: string): Promise<{ message: string }>;
    getCurrentPlan(userId: string): Promise<subscriptionDto>;
}