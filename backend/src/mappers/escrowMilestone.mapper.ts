import { AdminEscrowMilestoneDTO } from "dtos/adminEscrowMilestone.dto";

export function mapEscrowMilestone(
  doc: any
): AdminEscrowMilestoneDTO {

  const milestone = doc.milestones;

  if (!milestone) {
    throw new Error("Milestone missing in escrow aggregation result");
  }

  return {
    assignmentId: doc._id.toString(),
    jobId: doc.jobId?.toString(),
    jobTitle: doc.job?.title,

    milestoneId: milestone._id.toString(),
    milestoneTitle: milestone.title,
    milestoneAmount: milestone.amount,
    milestoneStatus: milestone.status,
    milestoneDueDate: milestone.dueDate,
    submittedAt: milestone.submittedAt,

    freelancer: {
      id: doc.freelancer?._id.toString(),
      name: doc.freelancer?.name,
      email: doc.freelancer?.email,
    },

    payment: doc.payment?._id
      ? {
          id: doc.payment._id.toString(),
          amount: doc.payment.amount,
          status: doc.payment.status,
          provider: doc.payment.provider,
          referenceId: doc.payment.referenceId,
          createdAt: doc.payment.createdAt,
        }
      : undefined,

    createdAt: milestone.createdAt ?? doc.createdAt,
  };
}
