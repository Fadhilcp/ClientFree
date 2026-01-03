export interface ClientProfileDto {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: string;
  phone?: string;
  status: string;
  profileImage?: string;
  isProfileComplete: boolean;
  isVerified: boolean;
  
  description?: string;

  company?: {
    name?: string;
    industry?: string;
    website?: string;
  };

  stats: {
    totalProjectsPosted: number;
    totalSpent: number;
  };

  ratings: {
    asClient: number;
  };

  location?: {
    city?: string;
    state?: string;
    country?: string;
  };

  createdAt: Date;
}