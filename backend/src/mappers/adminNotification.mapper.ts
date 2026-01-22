import { AdminNotificationDTO } from "../dtos/notification.dto";
import { INotificationDocument } from "../types/notification.type";

export const mapNotification = (
  doc: INotificationDocument
): AdminNotificationDTO => {
  return {
    id: doc._id.toString(),

    scope: doc.scope,

    roles: doc.roles ?? [],
    userIds: doc.userIds?.map(id => id.toString()) ?? [],

    category: doc.category,

    subject: doc.subject,
    message: doc.message,

    sendAs: doc.sendAs,

    createdBy: doc.createdBy?.toString() ?? null,

    createdAt: doc.createdAt?.toISOString() ?? null,

    isDeleted: doc.isDeleted,
    deletedAt: doc.deletedAt?.toISOString() ?? null
  };
};
