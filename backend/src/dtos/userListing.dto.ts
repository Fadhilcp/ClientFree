import { Types } from "mongoose";

export interface UserListingDto {
  id: string;
  profileImage?: string | null;
  username: string;
  name: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  status: "active" | "inactive" | "banned";
  lastLoginAt?: Date;
  isVerified?: boolean;
  subscription?: string | Types.ObjectId;
  createdAt: Date;
}