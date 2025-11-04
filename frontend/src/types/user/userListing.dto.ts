export interface UserListingDto {
  id: string;
  username: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  status: "active" | "inactive" | "banned";
  profileImage?: string;
  lastLoginAt: string; 
  isVerified: boolean;
  createdAt: string;
}