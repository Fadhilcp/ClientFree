import type { SkillItem } from "../skill.types";

export interface FreelancerProfileDto {
  id: string;
  username: string;
  email: string;
  role: string;
  profileImage?: string;

  name?: string;
  professionalTitle?: string;
  hourlyRate?: string;
  experienceLevel?: string;
  about?: string;
  description?: string;
  skills?: SkillItem[];

  externalLinks?: {
    type: string;
    url: string;
  }[];

  portfolio?: {
    portfolioFile?: string;
    resume?: string;
  };

  stats: {
    jobsCompleted: number;
    reviewsCount: number;
    earningTotal: number;
  };

  ratings: {
    asFreelancer: number;
  };

  location?: {
    city?: string;
    state?: string;
    country?: string;
  };

  createdAt: string;
}