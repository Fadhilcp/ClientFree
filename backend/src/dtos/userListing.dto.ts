import { Types } from "mongoose";

export interface UserListingDto {
  _id: string;
  profileImage?: string;
  username: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  status: "active" | "inactive" | "banned";
  lastLoginAt?: Date;
  isVerified?: boolean;
  subscription?: string | Types.ObjectId;
  createdAt: Date;
}