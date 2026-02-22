import { AdminNotificationDTO, NotificationDTO } from "../dtos/notification.dto";
import { INotificationDocument } from "../types/notification.type";
import { INotificationRecipientDocument } from "../types/notificationRecipient.type";

// for user
export const mapUserNotification = (
  doc: INotificationRecipientDocument
): NotificationDTO => {
  const notificationObj = doc.notificationId;

  const notification = notificationObj as unknown as Partial<INotificationDocument>;

  if (!notification) {
    throw new Error("Notification not populated");
  }

  return {
    id: notification._id!.toString() ?? doc.notificationId.toString(),
    category: notification.category ?? "",
    subject: notification.subject ?? "",
    message: notification.message ?? "",
    isRead: doc.isRead,
    createdAt: notification.createdAt?.toISOString() ?? ""
  };
};
// for admin 
export const mapAdminNotification = (
  doc: INotificationRecipientDocument
): AdminNotificationDTO => {

  const notification = doc.notificationId as unknown as Partial<INotificationDocument>;

  if (!notification || !notification._id) {
    throw new Error("Notification not populated");
  }

  return {
    id: notification._id.toString(),

    scope: notification.scope!,

    roles: notification.roles ?? undefined,
    userIds: notification.userIds?.map(id => id.toString()),

    category: notification.category!,

    subject: notification.subject ?? "",
    message: notification.message ?? "",

    sendAs: notification.sendAs!,

    createdBy: notification.createdBy
      ? notification.createdBy.toString()
      : null,

    createdAt: notification.createdAt
      ? notification.createdAt.toISOString()
      : null,

    isDeleted: notification.isDeleted ?? false,

    deletedAt: notification.deletedAt
      ? notification.deletedAt.toISOString()
      : null
  };
};