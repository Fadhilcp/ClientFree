import { IProposalInvitationDocument } from "types/proposalInvitation.type";
import { ProposalDTO } from "dtos/proposal.dto";

export function mapProposal(
  doc: IProposalInvitationDocument
): ProposalDTO {
  return {
    id: doc._id.toString(),
    jobId: doc.jobId.toString(),
    freelancerId: doc.freelancerId.toString(),
    isInvitation: doc.isInvitation,
    invitedBy: doc.invitedBy ? doc.invitedBy.toString() : undefined,
    invitation: doc.invitation
      ? {
          title: doc.invitation.title,
          message: doc.invitation.message,
          respondedAt: doc.invitation.respondedAt,
        }
      : undefined,
    bidAmount: doc.bidAmount,
    duration: doc.duration,
    description: doc.description,
    milestones: doc.milestones?.map((m) => ({
      title: m.title,
      amount: m.amount,
      dueDate: m.dueDate,
      description: m.description,
    })),
    optionalUpgrades: doc.optionalUpgrades?.map((o) => ({
      addonId: o.addonId ? o.addonId.toString() : undefined,
      name: o.name,
      price: o.price,
    })),
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}