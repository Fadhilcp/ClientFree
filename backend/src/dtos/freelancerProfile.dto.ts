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
  skills?: string[];

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

  createdAt: Date;
}