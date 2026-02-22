import { NotificationRecipientRepository } from "../repositories/notificationRecipient.repository";
import { getIO } from "../config/socket.config";
import { INotificationDocument } from "../types/notification.type";

const notificationRecipientRepository = new NotificationRecipientRepository();

export const emitNotificationToUser = async(
    userId: string,
    notification: INotificationDocument
) => {
    const io = getIO();

    io.to(`user:${userId}`).emit("notification:new", {
        id: notification._id.toString(),
        category: notification.category,
        subject: notification.subject,
        message: notification.message,
        isRead: false,
        createdAt: notification.createdAt?.toISOString(),
    });

    await notificationRecipientRepository.updateMany(
        {
            notificationId: notification._id,
            userId
        },
        { deliveredViaSocket: true }
    );
};