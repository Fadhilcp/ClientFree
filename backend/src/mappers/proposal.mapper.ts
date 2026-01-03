import { IProposalInvitationDocument } from "types/proposalInvitation.type";
import { ProposalDTO } from "dtos/proposal.dto";
import { IUserDocument } from "types/user.type";
import { IJobDocument } from "types/job.type";

export function mapProposal(
  doc: IProposalInvitationDocument
): ProposalDTO {
  const freelancerObj = doc.freelancerId as unknown as Partial<IUserDocument>;
  const jobObj = doc.jobId as unknown as Partial<IJobDocument>;

  return {
    id: doc._id.toString(),
    freelancer: {
      id: freelancerObj._id
        ? freelancerObj._id.toString()
        : doc.freelancerId.toString(),
      username: freelancerObj.username ?? "",
      name: freelancerObj.name ?? "",
      email: freelancerObj.email ?? "",
      profileImage: freelancerObj.profileImage ?? null,
      isVerified: freelancerObj.isVerified ?? false,
    },
    job: {
      id: jobObj._id ? jobObj._id.toString() : "",
      title: jobObj.title ?? "",
      category: jobObj.category ?? "",
      subcategory: jobObj.subcategory ?? "",
      status: jobObj.status ?? "",
      clientId: jobObj?.clientId?.toString() ?? undefined,
      createdAt: jobObj.createdAt,
    },

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
    optionalUpgrade: doc.optionalUpgrade
      ? {
          addonId: doc.optionalUpgrade.addonId?.toString(),
          name: doc.optionalUpgrade.name,
          price: doc.optionalUpgrade.price,
        }
      : undefined,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}