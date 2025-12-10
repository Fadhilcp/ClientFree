import { AdminDisputeDto } from "dtos/adminDispute.dto";

export class AdminDisputeMapper {
  static map(dispute: any): AdminDisputeDto | null {
    if (!dispute) return null;

    return {
      id: dispute._id?.toString(),
      type: dispute.type,
      status: dispute.status,
      amount: dispute.amount,
      currency: dispute.currency,

      disputeReason: dispute.disputeReason || null,
      isDisputed: dispute.isDisputed || false,

      job: dispute.jobId
        ? {
            id: dispute.jobId._id?.toString(),
            title: dispute.jobId.title,
          }
        : null,

      milestoneId: dispute.milestoneId?._id?.toString() || dispute.milestoneId?.toString() || null,

      client: dispute.clientId
        ? {
            id: dispute.clientId._id?.toString(),
            name: dispute.clientId.name,
            email: dispute.clientId.email,
          }
        : null,

      freelancer: dispute.freelancerId
        ? {
            id: dispute.freelancerId._id?.toString(),
            name: dispute.freelancerId.name,
            email: dispute.freelancerId.email,
          }
        : null,

      raisedBy: dispute.userId
        ? {
            id: dispute.userId._id?.toString(),
            name: dispute.userId.name,
            email: dispute.userId.email,
          }
        : null,

      payment: {
        id: dispute._id?.toString(),
        provider: dispute.provider,
        method: dispute.method,
        providerOrderId: dispute.providerOrderId || null,
        providerPaymentId: dispute.providerPaymentId || null,
        providerSignature: dispute.providerSignature || null,
        paymentDate: dispute.paymentDate || null,
      },

      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
    };
  }

  static mapList(disputes: any[]) {
    return disputes.map(d => AdminDisputeMapper.map(d));
  }
}