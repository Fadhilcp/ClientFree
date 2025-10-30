import { Document, Types } from 'mongoose';

export interface ISubscription {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  startDate: Date;
  expiryDate: Date;
  autoRenew: boolean;
  billingInterval: "monthly" | "yearly";
  status: "active" | "expired" | "cancelled";
  gateway: "razorpay" | "stripe" | "manual";
  customerId?: string;
  subscriptionId?: string;
}

export interface ISubscriptionDocument extends ISubscription,Document{
  _id: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}