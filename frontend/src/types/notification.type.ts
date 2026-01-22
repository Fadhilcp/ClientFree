export interface NotificationDTO {
  id: string;
  category: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationScope = "global" | "role" | "users";

export type UserRole = "client" | "freelancer" | "admin";

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
  userIds?: string[]; 
  category: NotificationCategory;
  subject: string;
  message: string;
  sendAs: NotificationSendAs;
  createdBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
}