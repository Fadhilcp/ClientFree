import { WalletTransactionDTO } from "./walletTransaction.dto";

export interface BasePaymentOverviewDTO {
  walletBalance: number;
  paymentGraph: {
    month: number;
    year: number;
    total: number;
  }[];
  recentTransactions: WalletTransactionDTO[];
}
// client payment overview
export interface ClientPaymentOverviewDTO
  extends BasePaymentOverviewDTO {

  pendingPayments: number;
  releasedPayments: number;
  upcomingMilestones: number;

  paymentGraph: {
    month: number;
    year: number;
    type: "escrow_hold" | "escrow_release";
    total: number;
  }[];
}
// freelancer payment overview
export interface FreelancerPaymentOverviewDTO
  extends BasePaymentOverviewDTO {

  pendingClearance: number;
  totalEarned: number;
  totalWithdrawn: number;
}
