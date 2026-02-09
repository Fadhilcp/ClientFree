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
  hourlyRate?: number;
  experienceLevel?: string;
  about?: string;
  description?: string
  skills?: string[];
  isProfileComplete: boolean;
  isVerified: boolean;

  externalLinks?: {
    type: string;
    url: string;
  }[];

  portfolio?: {
    title: string;
    link?: string;
    file?: string;
    createdAt?: Date;
  }[];

  resume?: {
    fileUrl?: string;
    uploadedAt?: Date;
  };

  education?: {
    degree: string;
    institution: string;
    startYear: number;
    endYear?: number;
  }[];

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
  skills: string[];
  about: string;
  experienceLevel: string;
  ratings: number;
  professionalTitle: string;
  status: string;
  profileImage: string;
  isVerified: boolean;
}