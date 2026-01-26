export interface PaymentDTO {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;

  method?: string;
  provider?: string;

  referenceId?: string;
  providerPaymentId?: string;

  paymentDate?: Date;
  withdrawalDate?: Date;

  createdAt: Date;
}


export interface GetWithdrawalsResponse {
  balances: {
    available: number;
    escrow: number;
    pending: number;
    currency: string;
  };

  withdrawableAmount: number;

  withdrawals: PaymentDTO[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
