export interface WalletTransactionDTO {
  id: string;

  type:
    | "deposit"
    | "escrow_hold"
    | "escrow_release"
    | "payment"
    | "withdrawal"
    | "refund"
    | "fee"
    | "admin_adjustment";

  direction: "credit" | "debit";

  amount: number;
  currency: string;

  balanceAfter: {
    available: number;
    escrow: number;
    pending: number;
  };

  paymentId?: string;
  status: "completed" | "failed";
  createdAt?: Date;
}
