import { Document, Types } from "mongoose";

export interface IRevenue {
  type: 'commission' | 'subscription' | 'addOn';
  source: 'freelancer' | 'client';

  amount: number;
  currency?: string;

  referencePaymentId?: Types.ObjectId;
  referenceId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;

  method?: string;
  provider?: string;
  providerPaymentId?: string;

  gatewayFee?: number;

  status?: 'pending' | 'completed' | 'refunded' | 'failed';
}

export interface IRevenueDocument extends IRevenue, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}