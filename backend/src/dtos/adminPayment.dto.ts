export interface AdminPaymentDto {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  provider?: string;
  method?: string;
  referenceId?: string;
  createdAt: string;

  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
