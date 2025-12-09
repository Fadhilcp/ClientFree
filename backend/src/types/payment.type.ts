import { Document, Types } from "mongoose";

export interface IPayment {
  type: 'escrow' | 'milestone' | 'fullPayment' | 'refund' | 'withdrawal' | 'subscription';
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'cancelled' | 'onHold' | 'failed' | 'disputed';

  amount: number;
  currency?: string;

  method?: string;
  provider?: string;

  providerPaymentId?: string;
  providerOrderId?: string;
  providerSignature?: string;

  jobId?: Types.ObjectId | string;
  milestoneId?: Types.ObjectId | string;
  proposalId?: Types.ObjectId | string;

  freelancerId?: Types.ObjectId | string;
  clientId?: Types.ObjectId | string;
  userId?: Types.ObjectId | string;

  isDisputed?: boolean;
  disputeReason?: string;
  adminNotes?: string;

  platformFee?: number;
  paymentGatewayFee?: number;
  taxAmount?: number;

  refundReason?: string;

  paymentDate?: Date;
  escrowReleaseDate?: Date;
  refundDate?: Date;
  withdrawalDate?: Date;

  referenceId?: string;

  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface IPaymentDocument extends IPayment, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}