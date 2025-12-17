import { AdminApprovedMilestoneDetailDto } from "dtos/adminApprovedMilestoneDto";
import { IJobAssignmentDocument } from "types/jobAssignment.type";

export class AdminApprovedMilestoneDetailMapper {
  static map(doc: any): AdminApprovedMilestoneDetailDto {
    const m = doc.milestones[0];

    if (!m) throw new Error("Milestone missing in detail mapper");

    return {
      assignmentId: doc._id.toString(),

      job: {
        id: doc.jobId._id.toString(),
        title: doc.jobId.title,
        payment: {
          budget: doc.jobId.payment?.budget,
          type: doc.jobId.payment?.type
        }
      },

      freelancer: {
        id: doc.freelancerId._id.toString(),
        name: doc.freelancerId.name,
        email: doc.freelancerId.email
      },

      milestone: {
        id: m._id.toString(),
        title: m.title,
        description: m.description,
        amount: m.amount,
        status: m.status,
        submittedAt: m.submittedAt,
        submissionMessage: m.submissionMessage,
        submissionFiles: m.submissionFiles ?? []
      },

      payment: m.paymentId
        ? {
            id: m.paymentId._id.toString(),
            status: m.paymentId.status,
            amount: m.paymentId.amount,
            currency: m.paymentId.currency,
            provider: m.paymentId.provider,
            method: m.paymentId.method,
            paymentDate: m.paymentId.paymentDate
          }
        : null
    };
  }
}
