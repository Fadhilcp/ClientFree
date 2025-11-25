import { FreelancerProfileDto } from "./freelancerProfile.dto";

export interface JobBaseDTO {
  id: string;
  clientId: string;

  title: string;
  category?: string;
  subcategory?: string;

  skills?: string[];

  duration?: string;

  payment?: {
    budget?: number;
    type?: "fixed" | "hourly";
  };

  description?: string;

  visibility: "public" | "private";
  status: "open" | "active" | "completed" | "cancelled";

  proposalCount: number;
  isFeatured: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface JobListDTO extends JobBaseDTO {}

export interface AcceptedProposalDTO {
  id: string;
  bidAmount?: number;
  duration?: string;
  status: "pending" | "shortlisted" | "accepted" | "rejected" | "invited";
  freelancer?: FreelancerProfileDto | null;
}

export interface JobDetailDTO extends JobBaseDTO {
  locationPreference?: {
    city?: string;
    country?: string;
    type?: "specific" | "worldwide";
  };

  proposals: string[];
  isMultiFreelancer: boolean;
  acceptedProposals: AcceptedProposalDTO[];
}
