import type { Milestone } from "./assignment.type";

export interface IProposal {
  id: string;
  freelancer: {
    id: string;
    username: string;
    name: string;
    email: string;
    profileImage?: string | null;
    isVerified: boolean;
  };
  job?: {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    status: string;
    clientId?: string;
    createdAt?: Date;
  };
  invitedBy?: string;
  bidAmount: number;
  duration: string;
  description: string;
  milestones?: Milestone[];
  optionalUpgrade?: {
    addonId: string;
    name: "highlight" | "sponsored" | "sealed";
    price: number;
  };
  status: ProposalStatus;
  isInvitation: boolean;
  invitation: IInvitationDetails;
  createdAt: Date | string;
  updatedAt: Date | string;
}
export interface IInvitationDetails {
  title?: string;
  message?: string;
  respondedAt?: Date;
}


export type ProposalStatus = "pending" | "shortlisted" | "accepted" | "rejected" | "invited" | "withdrawn";

export interface IProposalForm {
  jobId: string;
  bidAmount: number;
  duration: string;
  description: string;
  milestones: Milestone[];
  optionalUpgradeId?: string;
}