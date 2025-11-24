import { ProposalStatus } from "types/proposalInvitation.type";

export interface ProposalDTO {
  id: string;
  jobId: string;
  freelancer: {
    id: string;
    username: string;
    email: string;
    profileImage?: string | null;
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

  optionalUpgrades?: {
    addonId?: string;
    name: "highlight" | "sponsored" | "sealed";
    price: number;
  }[];

  status: ProposalStatus;

  createdAt?: Date;
  updatedAt?: Date;
}