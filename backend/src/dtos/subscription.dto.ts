import { PlanFeatures } from "../types/plan.type";

export interface SubscriptionDto {
  id: string;
  userId: string | null;
  planId: string | null;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startDate: Date | null;
  expiryDate: Date | null;
  autoRenew: boolean;
  gateway: 'razorpay' | 'stripe' | 'manual';
  customerId: string | null;
  subscriptionId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}


export interface getActiveFeaturesDto { 
  planId: string;
  subscriptionId: string;
  planName: string;
  userType: string;
  features: PlanFeatures;
  expiryDate: Date;
  billingInterval: "monthly" | "yearly"
};