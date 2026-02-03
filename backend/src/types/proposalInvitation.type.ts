import { ProposalDTO } from "../dtos/proposal.dto";
import { Document, Types } from "mongoose";
import { Orders } from "razorpay/dist/types/orders";

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
  name: string;
  price: number;
}

export type ProposalStatus = "pending" | "shortlisted" | "accepted" | "rejected" | "invited" | "withdrawn"

export interface IProposalInvitation {
  jobId: Types.ObjectId | string;
  freelancerId: Types.ObjectId | string;

  isInvitation: boolean;
  invitedBy?: Types.ObjectId | string;

  invitation?: IInvitationDetails;

  bidAmount?: number;
  duration?: string;
  description?: string;

  milestones?: IProposalMilestone[];
  upgradeStatus: "none" | "pending" | "paid";
  optionalUpgrade?: IOptionalUpgrade;

  status: ProposalStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProposalInvitationDocument extends IProposalInvitation,Document {
  _id: Types.ObjectId;
}



// type of create proposal response 
export interface CreateProposalResponse {
    proposal: ProposalDTO;
    paymentOrder: Orders.RazorpayOrder | null;
    paymentId: string | null;
    addOn: {
        id: string;
        price: number;
        name: string;
    } | null;
    warning?: string | null;
}

export interface IProposalInvitationPayload {
    jobId: string;     
    bidAmount: number;
    duration: string;
    description: string;    
    milestones: Array<IProposalMilestone>;
    optionalUpgradeId?: string; 
}