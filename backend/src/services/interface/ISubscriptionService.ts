import { UserSubscriptionsDTO } from "dtos/userSubscriptions.dto";
import { getActiveFeaturesDto, SubscriptionDto } from "../../dtos/subscription.dto";
import { PaginatedResult } from "../../types/pagination";
import { ISubscription } from "../../types/subscription.type";

export interface ISubscriptionService {
    getAll(search: string, status: string, page: number, limit: number): Promise<PaginatedResult<SubscriptionDto>>;
    createSubscription(data: Partial<ISubscription> & { userId: string, email: string; contact: string })
    : Promise<{ checkoutUrl: string }>;
    upgradeSubscription(userId: string, planId: string, billingInterval: "monthly" | "yearly")
    : Promise<{ paymentUrl?: string }>;
    cancelSubscription(userId: string): Promise<{ message: string }>;
    getCurrentPlan(userId: string): Promise<SubscriptionDto>;
    getActiveFeatures(userId: string)
        : Promise<getActiveFeaturesDto | null>;
    expireSubscriptions(): Promise<number>;
    getMySubscriptions(userId: string, page: number, limit: number): Promise<PaginatedResult<UserSubscriptionsDTO>>;
}