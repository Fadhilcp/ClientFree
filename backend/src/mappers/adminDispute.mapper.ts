import { AdminDisputeDto, AdminDisputeListDto } from "dtos/adminDispute.dto";
import { PopulatedPayment } from "types/payment/payment.populated";

export class AdminDisputeMapper {
  static map(dispute: PopulatedPayment): AdminDisputeDto {

    return {
      id: dispute._id.toString(),
      type: dispute.type,
      status: dispute.status,
      amount: dispute.amount,
      currency: dispute.currency ?? "",

      disputeReason: dispute.disputeReason || null,
      isDisputed: dispute.isDisputed ?? false,

      job: dispute.jobId
        ? {
            id: dispute.jobId._id.toString(),
            title: dispute.jobId.title,
            category: dispute.jobId.category,
            subcategory: dispute.jobId.subcategory,
            description: dispute.jobId.description,
            duration: dispute.jobId.duration,
            payment: dispute.jobId.payment,
            skills: dispute.jobId.skills || [],
          }
        : null,

      milestoneId:
        dispute.milestoneId?._id?.toString() ||
        dispute.milestoneId?.toString() ||
        null,

      client: dispute.clientId
        ? {
            id: dispute.clientId._id.toString(),
            name: dispute.clientId.name,
            email: dispute.clientId.email,
            profileImage: dispute.clientId.profileImage || null,
            company: dispute.clientId.company || null,
          }
        : null,

      freelancer: dispute.freelancerId
        ? {
            id: dispute.freelancerId._id.toString(),
            name: dispute.freelancerId.name,
            email: dispute.freelancerId.email,
            profileImage: dispute.freelancerId.profileImage || null,
            professionalTitle: dispute.freelancerId.professionalTitle || null,
            experienceLevel: dispute.freelancerId.experienceLevel || null,
            hourlyRate: dispute.freelancerId.hourlyRate || null,
            about: dispute.freelancerId.about || null,
          }
        : null,

      raisedBy: dispute.userId
        ? {
            id: dispute.userId._id.toString(),
            name: dispute.userId.name,
            email: dispute.userId.email,
          }
        : null,

      payment: {
        id: dispute._id.toString(),
        provider: dispute.provider ?? "",
        method: dispute.method ?? "",
        providerOrderId: dispute.providerOrderId || null,
        providerPaymentId: dispute.providerPaymentId || null,
        providerSignature: dispute.providerSignature || null,
        paymentDate: dispute.paymentDate || null,
        platformFee: dispute.platformFee || 0,
        paymentGatewayFee: dispute.paymentGatewayFee || 0,
        taxAmount: dispute.taxAmount || 0,
      },

      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
    };
  }

  static toListDto(dispute: PopulatedPayment): AdminDisputeListDto {
    return {
      id: dispute._id.toString(),
      amount: dispute.amount,
      disputeReason: dispute.disputeReason || null,
      status: dispute.status,

      job: dispute.jobId
        ? {
            id: dispute.jobId._id.toString(),
            title: dispute.jobId.title,
          }
        : null,

      raisedBy: dispute.userId
        ? {
            id: dispute.userId._id.toString(),
            name: dispute.userId.name,
          }
        : null,

      createdAt: dispute.createdAt,
    };
  }

  static mapList(disputes: any[]) {
    return disputes.map(AdminDisputeMapper.toListDto);
  }
}