import { Document, Types } from "mongoose";
import { UserRole } from "../constants/user.constants";

export type NotificationScope = "global" | "role" | "users";

export type NotificationCategory =
  | "job_posted"
  | "proposal_received"
  | "proposal_accepted"
  | "payment"
  | "admin_announcement"
  | "system";

export type NotificationSendAs = "in-app" | "email" | "both";

export interface INotification {
  scope: NotificationScope;

  roles?: UserRole[];        
  userIds?: Types.ObjectId[]; 

  category: NotificationCategory;

  subject: string;
  message: string;

  sendAs: NotificationSendAs;

  createdBy?: Types.ObjectId;

  isDeleted: boolean;

  deletedAt?: Date;
}

export interface INotificationDocument
  extends INotification,
    Document {
  _id: Types.ObjectId;
  createdAt?: Date;
}
