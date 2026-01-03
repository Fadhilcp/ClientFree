export interface AdminEscrowMilestoneDTO {
  assignmentId: string;
  jobId: string;
  jobTitle?: string;

  milestoneId: string;
  milestoneTitle: string;
  milestoneAmount: number;
  milestoneStatus: string;
  milestoneDueDate?: Date;
  submittedAt?: Date;

  freelancer: {
    id: string;
    name: string;
    email: string;
  };

  payment?: {
    id: string;
    amount: number;
    status: string;
    provider?: string;
    referenceId?: string;
    createdAt?: Date;
  };

  createdAt: Date;
}
