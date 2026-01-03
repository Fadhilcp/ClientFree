export interface AdminWithdrawalDTO {
  id: string;

  amount: number;
  currency: string;

  status: string;
  provider: string;
  method?: string;

  referenceId?: string;
  providerPaymentId?: string;

  requestedAt: Date;
  processedAt?: Date;

  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
