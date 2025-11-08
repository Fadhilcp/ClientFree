import { SubscriptionDto } from "dtos/subscription.dto";
import { PaginatedResult } from "types/pagination";
import { ISubscription, ISubscriptionDocument } from "types/subscription.type";


export interface ISubscriptionService {
    getAll(search: string, status: string, page: number, limit: number): Promise<PaginatedResult<SubscriptionDto>>;
    createSubscription(data: Partial<ISubscription> & { email: string; contact: string }): Promise<ISubscriptionDocument>;
    verifyPayment({}: Record<string, string>): Promise<{ message: string }>;
    cancelSubscription(userId: string, subscriptionId: string): Promise<{ message: string }>;
    getCurrentPlan(userId: string): Promise<SubscriptionDto>;
}