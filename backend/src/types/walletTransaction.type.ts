import { Document, Types } from "mongoose";

export type WalletTransactionType =
  | "deposit"
  | "escrow_hold"
  | "escrow_release"
  | "payment"
  | "withdrawal"
  | "refund"
  | "fee"
  | "admin_adjustment";

export type WalletTransactionDirection = "credit" | "debit";
export type WalletTransactionStatus = "completed" | "failed";

export interface IWalletTransactionBalance {
  available: number;
  escrow: number;
  pending: number;
}

export interface IWalletTransaction {
  walletId: Types.ObjectId;
  userId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  currency: string;
  balanceAfter: IWalletTransactionBalance;
  status: WalletTransactionStatus;
}

export interface IWalletTransactionDocument extends IWalletTransaction, Document {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}