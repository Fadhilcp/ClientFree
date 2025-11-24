export interface IProposal {
  id: string;
  freelancer: {
    id: string;
    username: string;
    email: string;
    profileImage?: string | null;
  };
  invitedBy?: string;
  jobId: string;
  bidAmount: number;
  duration: string;
  description: string;
  milestones?: Milestone[];
  optionalUpgrades?: Array<{
    addonId: string;
    name: "highlight" | "sponsored" | "sealed";
    price: number;
  }>;
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

export interface Milestone {
  title: string;
  amount: number;
  dueDate?: string;
  description?: string;
}

export type ProposalStatus = "pending" | "shortlisted" | "accepted" | "rejected" | "invited";