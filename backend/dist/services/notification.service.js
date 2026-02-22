"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const notification_mapper_1 = require("../mappers/notification.mapper");
const adminNotification_mapper_1 = require("../mappers/adminNotification.mapper");
const notificationSocket_1 = require("../helpers/notificationSocket");
class NotificationService {
    constructor(_notificationRepository, _notificationRecipientRepository, _userRepository) {
        this._notificationRepository = _notificationRepository;
        this._notificationRecipientRepository = _notificationRecipientRepository;
        this._userRepository = _userRepository;
    }
    ;
    async createNotification(data) {
        if (data.scope === "role" && !data.roles?.length) {
            throw new Error("roles required when scope = 'role'");
        }
        if (data.scope === "users" && !data.userIds?.length) {
            throw new Error("userIds required when scope = 'users'");
        }
        const notification = await this._notificationRepository.create(data);
        let userIds = [];
        if (data.scope === "global") {
            const users = await this._userRepository.find({}, { sort: { _id: 1 } });
            userIds = users.map(u => u._id);
        }
        if (data.scope === "role") {
            const users = await this._userRepository.find({ role: { $in: data.roles } }, { sort: { _id: 1 } });
            userIds = users.map(u => u._id);
        }
        if (data.scope === "users") {
            userIds = data.userIds;
        }
        const recipients = userIds.map(userId => ({
            notificationId: notification._id,
            userId
        }));
        await this._notificationRecipientRepository.insertMany(recipients);
        // send notification through socket
        for (const userId of userIds) {
            (0, notificationSocket_1.emitNotificationToUser)(userId.toString(), notification).catch(console.error);
        }
        return (0, adminNotification_mapper_1.mapNotification)(notification);
    }
    async updateNotification(notificationId, data) {
        const notification = await this._notificationRepository.findByIdAndUpdate(notificationId, data);
        if (!notification)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.NOTIFICATION_NOT_FOUND);
        return (0, adminNotification_mapper_1.mapNotification)(notification);
    }
    async deleteNotification(notificationId) {
        const notification = await this._notificationRepository.findById(notificationId);
        if (!notification) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.NOTIFICATION_NOT_FOUND);
        }
        if (notification.isDeleted)
            return;
        notification.isDeleted = true;
        notification.deletedAt = new Date();
        await notification.save();
    }
    async getUserNotifications(userId, page, limit) {
        const result = await this._notificationRecipientRepository.getUserNotificationsPaginated(userId, page, limit);
        return {
            ...result,
            data: result.data.map(notification_mapper_1.mapUserNotification)
        };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this._notificationRecipientRepository.markAsRead(notificationId, userId);
        if (!notification)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Notification recipient not found");
        return (0, notification_mapper_1.mapUserNotification)(notification);
    }
    async countUnread(userId) {
        return await this._notificationRecipientRepository.count({
            userId,
            isRead: false
        });
    }
    async markAllAsRead(userId) {
        const result = await this._notificationRecipientRepository.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
        return { modifiedCount: result.modifiedCount };
    }
    async getAdminNotifications(search, page, limit) {
        const filter = { isDeleted: false };
        if (search && search.trim().length > 0) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { subject: regex },
                { message: regex }
            ];
        }
        const result = await this._notificationRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(adminNotification_mapper_1.mapNotification)
        };
    }
}
exports.NotificationService = NotificationService;
