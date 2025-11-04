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