import { Document, Types } from "mongoose";

export interface IInvitationDetails {
  title?: string;
  message?: string;
  respondedAt?: Date;
}

export interface IProposalMilestone {
  title: string;
  amount: number;
  dueDate?: Date;
  description?: string;
}

export interface IOptionalUpgrade {
  addonId?: Types.ObjectId;
  name: "highlight" | "sponsored" | "sealed";
  price: number;
}

export type ProposalStatus = "pending" | "shortlisted" | "accepted" | "rejected" | "invited"

export interface IProposalInvitation {
  jobId: Types.ObjectId | string;
  freelancerId: Types.ObjectId | string;

  isInvitation: boolean;
  invitedBy?: Types.ObjectId;

  invitation?: IInvitationDetails;

  bidAmount?: number;
  duration?: string;
  description?: string;

  milestones?: IProposalMilestone[];
  optionalUpgrades?: IOptionalUpgrade[];

  status: ProposalStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProposalInvitationDocument extends IProposalInvitation,Document {
  _id: Types.ObjectId;
}