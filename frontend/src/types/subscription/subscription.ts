import type { PlanFeatures } from "./plan";

export interface SubscriptionInfo {
    planId: string;
    subscriptionId: string;
    planName: string;
    userType: "client" | "freelancer";
    features: PlanFeatures;
    expiryDate: string;
    billingInterval: "monthly" | "yearly"
}