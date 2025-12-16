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
    category: string;
    subcategory: string;
    description: string;
    duration: string;
    payment: {
      budget: number;
      type: "fixed" | "hourly";
    };
    skills: string[]; // ObjectId strings (can later be expanded)
  } | null;

  milestoneId: string | null;

  client: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
    company: {
      name: string;
      industry: string;
      website: string;
    } | null;
  } | null;

  freelancer: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
    professionalTitle: string | null;
    experienceLevel: string | null;
    hourlyRate: string | null;
    about: string | null;
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
    platformFee: number;
    paymentGatewayFee: number;
    taxAmount: number;
  };

  createdAt: Date;
  updatedAt: Date;
}