"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitNotificationToUser = void 0;
const notificationRecipient_repository_1 = require("../repositories/notificationRecipient.repository");
const socket_config_1 = require("../config/socket.config");
const notificationRecipientRepository = new notificationRecipient_repository_1.NotificationRecipientRepository();
const emitNotificationToUser = async (userId, notification) => {
    const io = (0, socket_config_1.getIO)();
    io.to(`user:${userId}`).emit("notification:new", {
        id: notification._id.toString(),
        category: notification.category,
        subject: notification.subject,
        message: notification.message,
        isRead: false,
        createdAt: notification.createdAt?.toISOString(),
    });
    await notificationRecipientRepository.updateMany({
        notificationId: notification._id,
        userId
    }, { deliveredViaSocket: true });
};
exports.emitNotificationToUser = emitNotificationToUser;
