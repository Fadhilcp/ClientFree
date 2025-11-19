import { Document, Types } from "mongoose";

export interface IInvitationDetails {
  title?: string;
  message?: string;
  respondedAt?: Date;
}

export interface IMilestone {
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

export interface IProposalInvitation {
  jobId: Types.ObjectId | string;
  freelancerId: Types.ObjectId;

  isInvitation: boolean;
  invitedBy?: Types.ObjectId;

  invitation?: IInvitationDetails;

  bidAmount?: number;
  duration?: string;
  description?: string;

  milestones?: IMilestone[];
  optionalUpgrades?: IOptionalUpgrade[];

  status: "pending" | "accepted" | "rejected" | "invited";

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProposalInvitationDocument extends IProposalInvitation,Document {
  _id: Types.ObjectId;
}