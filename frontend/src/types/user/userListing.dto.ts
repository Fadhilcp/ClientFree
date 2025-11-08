export interface UserListingDto {
  _id: string;
  profileImage?: string;
  username: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  status: "active" | "inactive" | "banned";
  lastLoginAt: string;
  isVerified: boolean;
  subscription?: string;
  createdAt: string;
}