export interface ClientProfileDto {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  role: string;
  
  description?: string;

  name?: string;
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