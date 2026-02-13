export interface ClientProfileDto {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: "client"; 
  phone?: string;
  status: string;
  profileImage?: string;
  
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

export interface ClientPublicDto {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  description?: string;
  isVerified: boolean;

  location?: {
    city?: string;
    state?: string;
    country?: string;
  };

  company?: {
    name?: string;
    industry?: string;
    website?: string;
  };
}
