import type { SkillItem } from "../skill.types";

export interface PortfolioItem {
  title: string;
  link?: string;
  file?: string;
  createdAt: string | Date;
}

export interface EducationItem {
  degree: string;
  institution: string;
  startYear: number;
  endYear?: number;
}

export interface Resume {
  fileUrl: string;
  uploadedAt: string | Date;
}

export interface FreelancerProfileDto {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  role: string;
  status: string;
  name?: string;
  phone?: string;
  professionalTitle?: string;
  hourlyRate?: string;
  experienceLevel?: string;
  about?: string;
  description?: string
  skills?: SkillItem[];

  externalLinks?: {
    type: string;
    url: string;
  }[];

  portfolio?: PortfolioItem[]

  resume?: Resume;

  education?: EducationItem[];

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

  createdAt: Date;
}

export interface FreelancerListItemDto {
  id: string;
  username: string;
  name: string;
  email: string;
  skills: SkillItem[];
  about: string;
  experienceLevel: string;
  ratings: number;
  professionalTitle: string;
  status: string;
  profileImage: string;
  isInterested?: boolean;
  isVerified: boolean;
}