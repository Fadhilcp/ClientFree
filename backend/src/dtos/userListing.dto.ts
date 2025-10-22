export interface UserListingDto {
  id: string;
  username: string;
  name?: string;
  email: string;
  role: 'freelancer' | 'client' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  lastLoginAt: Date;
  profileImage?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  isVerified: boolean;
  isPremium: boolean;
  createdAt: Date;
  experienceLevel?: string;
  professionalTitle?: string;
  hourlyRate?: string;
  company?: {
    name?: string;
    industry?: string;
    website?: string;
  };
}