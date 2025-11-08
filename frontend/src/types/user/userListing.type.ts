export type UserListing = {
  id: string;
  profileImage?: string;
  username: string;
  name?: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  joined: string;
  lastLoginAt: string;
  subscription: string;
};