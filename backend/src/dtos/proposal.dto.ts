import { ProposalStatus } from "types/proposalInvitation.type";

export interface ProposalDTO {
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

  isInvitation: boolean;
  invitedBy?: string;

  invitation?: {
    title?: string;
    message?: string;
    respondedAt?: Date;
  };

  bidAmount?: number;
  duration?: string;
  description?: string;

  milestones?: {
    title: string;
    amount: number;
    dueDate?: Date;
    description?: string;
  }[];

  optionalUpgrade?: {
    addonId?: string;
    name: string;
    price: number;
  };

  status: ProposalStatus;

  createdAt?: Date;
  updatedAt?: Date;
}


export type IProposalStatus =
  | "NONE"
  | "SUBMITTED"
  | "INVITED"
  | "UPGRADE_PENDING";

export interface ProposalCheckStatusResponse {
  status: IProposalStatus;
  message: string;
  proposalId?: string;
}