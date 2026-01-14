import { UserSubscriptionsDTO } from "dtos/userSubscriptions.dto";
import { getActiveFeaturesDto, SubscriptionDto } from "../../dtos/subscription.dto";
import { PaginatedResult } from "../../types/pagination";
import { PlanFeatures } from "../../types/plan.type";
import { ISubscription, ISubscriptionDocument } from "../../types/subscription.type";

export interface ISubscriptionService {
    getAll(search: string, status: string, page: number, limit: number): Promise<PaginatedResult<SubscriptionDto>>;
    createSubscription(data: Partial<ISubscription> & { userId: string, email: string; contact: string }): Promise<{ checkoutUrl: string }>;
    
    cancelSubscription(userId: string): Promise<{ message: string }>;
    getCurrentPlan(userId: string): Promise<SubscriptionDto>;
    getActiveFeatures(userId: string)
        : Promise<{ planName: string, userType: string, features: PlanFeatures, expiryDate: Date } | null>;
    expireSubscriptions(): Promise<number>;
    getMySubscriptions(userId: string, page: number, limit: number): Promise<PaginatedResult<UserSubscriptionsDTO>>;
}