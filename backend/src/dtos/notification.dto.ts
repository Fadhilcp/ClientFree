import { UserRole } from "constants/user.constants";
import { NotificationCategory, NotificationScope, NotificationSendAs } from "../types/notification.type";
import { Types } from "mongoose";

export interface NotificationDTO {
  id: string;
  category: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminNotificationDTO {
  id: string;
  scope: NotificationScope;
  roles?: UserRole[];
  userIds?: string[];
  category: NotificationCategory;
  subject: string;
  message: string;
  sendAs: NotificationSendAs;
  createdBy: string | null;
  createdAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface CreateNotificationDTO {
  scope: NotificationScope;

  roles?: UserRole[];
  userIds?: Types.ObjectId[];

  category: NotificationCategory;
  subject: string;
  message: string;

  sendAs: NotificationSendAs;
  createdBy?: Types.ObjectId;
}
