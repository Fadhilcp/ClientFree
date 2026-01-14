export interface UserSubscriptionsDTO {
  id: string; 
  subscriptionId: string | null;

  planId: string | null;
  planName: string;
  userType: "client" | "freelancer";

  billingInterval: "monthly" | "yearly";
  status: "pending" | "active" | "cancelled" | "expired";

  amount: number;
  currency: string;

  startDate: Date | null;
  expiryDate: Date | null;

  createdAt: Date;
}
