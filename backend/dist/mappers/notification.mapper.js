"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapAdminNotification = exports.mapUserNotification = void 0;
// for user
const mapUserNotification = (doc) => {
    const notificationObj = doc.notificationId;
    const notification = notificationObj;
    if (!notification) {
        throw new Error("Notification not populated");
    }
    return {
        id: notification._id.toString() ?? doc.notificationId.toString(),
        category: notification.category ?? "",
        subject: notification.subject ?? "",
        message: notification.message ?? "",
        isRead: doc.isRead,
        createdAt: notification.createdAt?.toISOString() ?? ""
    };
};
exports.mapUserNotification = mapUserNotification;
// for admin 
const mapAdminNotification = (doc) => {
    const notification = doc.notificationId;
    if (!notification || !notification._id) {
        throw new Error("Notification not populated");
    }
    return {
        id: notification._id.toString(),
        scope: notification.scope,
        roles: notification.roles ?? undefined,
        userIds: notification.userIds?.map(id => id.toString()),
        category: notification.category,
        subject: notification.subject ?? "",
        message: notification.message ?? "",
        sendAs: notification.sendAs,
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
exports.mapAdminNotification = mapAdminNotification;
