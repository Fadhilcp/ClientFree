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
