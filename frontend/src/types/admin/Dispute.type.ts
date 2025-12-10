export interface AdminDisputeDto {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;

  disputeReason: string | null;
  isDisputed: boolean;

  job: {
    id: string;
    title: string;
  } | null;

  milestoneId: string | null;

  client: {
    id: string;
    name: string;
    email: string;
  } | null;

  freelancer: {
    id: string;
    name: string;
    email: string;
  } | null;

  raisedBy: {
    id: string;
    name: string;
    email: string;
  } | null;

  payment: {
    id: string;
    provider: string;
    method: string;
    providerOrderId: string | null;
    providerPaymentId: string | null;
    providerSignature: string | null;
    paymentDate: Date | null;
  };

  createdAt: Date;
  updatedAt: Date;
}