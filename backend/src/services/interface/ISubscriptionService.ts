import { subscriptionDto } from "dtos/subscription.dto";
import { ISubscription, ISubscriptionDocument } from "types/subscription.type";


export interface ISubscriptionService {
    createSubscription(data: ISubscription & { email: string; contact: string }): Promise<ISubscriptionDocument>;
    getCurrentPlan(userId: string): Promise<subscriptionDto>;
}