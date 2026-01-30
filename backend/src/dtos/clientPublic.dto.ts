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
