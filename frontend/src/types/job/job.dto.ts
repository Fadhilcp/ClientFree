import type { SkillItem } from "../skill.types";
import type { ClientPublicDto } from "../user/clientProfile.dto";

export interface JobBaseDTO {
  id: string;
  client: ClientPublicDto;

  title: string;
  category?: string;
  subcategory?: string;

  skills?: SkillItem[];

  isVerified: boolean;

  duration?: string;
  hoursPerDay?: number;

  payment?: {
    budget?: number;
    type?: "fixed" | "hourly";
  };

  description?: string;

  visibility: "public" | "private";
  status: "open" | "active" | "completed" | "cancelled";

  proposalCount: number;
  isFeatured: boolean;

  isInterested?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface JobListDTO extends JobBaseDTO {}

export interface FreelancerProfileDTO {
  id: string;
  username: string;
  name?: string;
  profileImage?: string;
  professionalTitle?: string;
  hourlyRate?: string;
  experienceLevel?: string;
  skills?: { id: string; name: string }[];
  stats?: any;
  ratings?: any;
}

export interface AcceptedProposalDTO {
  id: string;
  bidAmount?: number;
  duration?: string;
  status: "pending" | "shortlisted" | "accepted" | "rejected" | "invited";
  freelancer?: FreelancerProfileDTO | null;
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

export interface JobForm {
  title: string;
  category: string;
  subcategory: string;
  skills: string[];
  duration: string;
  paymentBudget: string;
  paymentType: "fixed" | "hourly";
  description: string;
  visibility: "public" | "private";
  locationCity: string;
  locationCountry: string;
  locationType: "specific" | "worldwide";
  isFeatured: boolean;
  [key: string]: any;
}