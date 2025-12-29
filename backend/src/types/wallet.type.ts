import { Document, Types } from "mongoose";

export type WalletRole = "client" | "freelancer" | "admin";
export type WalletStatus = "active" | "suspended";

export interface IWalletBalance {
  available: number;
  escrow: number;
  pending: number;
}

export interface IWallet {
  userId: Types.ObjectId;
  role: WalletRole;
  balance: IWalletBalance;
  currency: string;
  status: WalletStatus;
}

export interface IWalletDocument extends IWallet, Document {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}



export interface FinancialReportSummary {
  freelancer: {
    totalEarned: number;
    withdrawn: number;
    platformFees: number;
  };
  client: {
    totalSpent: number;
    refunded: number;
  };
  inEscrow: number;
}
