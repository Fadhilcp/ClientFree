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
