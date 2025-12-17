export interface AdminApprovedMilestoneDto {
  id: string;
  milestoneId: string;
  assignmentId: string;
  jobId: string;
  freelancerId: string;
  proposalId: string;

  paymentId: string | null;

  title: string;
  description: string | null;
  amount: number;
  status: string;

  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminApprovedMilestoneDetailDto {
  assignmentId: string;

  job: {
    id: string;
    title: string;
    payment: {
      budget: number;
      type: string;
    };
  };

  freelancer: {
    id: string;
    name: string;
    email: string;
    professionalTitle?: string;
    location?: {
      city?: string;
      country?: string;
    };
  };

  milestone: {
    id: string;
    title: string;
    description?: string;
    amount: number;
    status: string;
    dueDate?: Date;
    submittedAt?: Date;
    submissionMessage?: string;
    submissionFiles: {
      url: string;
      name: string;
      type: string;
      key: string;
    }[];
  };

  payment: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    provider: string;
    method: string;
    paymentDate?: Date;
  } | null;
}
