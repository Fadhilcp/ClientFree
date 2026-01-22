import { NotificationRepository } from "../repositories/notification.repository";
import { INotificationService } from "./interface/INotificationService";
import { INotification, INotificationDocument } from "../types/notification.type";
import { FilterQuery, Types } from "mongoose";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { mapAdminNotification, mapUserNotification } from "../mappers/notification.mapper";
import { mapNotification } from "../mappers/adminNotification.mapper";
import { INotificationRepository } from "repositories/interfaces/INotificationRepository";
import { INotificationRecipientRepository } from "../repositories/interfaces/INotificationRecipientRepository";
import { emitNotificationToUser } from "helpers/notificationSocket";
import { UserRole } from "types/user.type";

export class NotificationService implements INotificationService {
    constructor(
        private _notificationRepository: INotificationRepository,
        private _notificationRecipientRepository: INotificationRecipientRepository,
        private _userRepository: IUserRepository,
    ){};

    async createNotification(data: INotification): Promise<any> {
        
        if (data.scope === "role" && !data.roles?.length) {
            throw new Error("roles required when scope = 'role'");
        }

        if (data.scope === "users" && !data.userIds?.length) {
            throw new Error("userIds required when scope = 'users'");
        }

        const notification = await this._notificationRepository.create(data);

        let userIds: Types.ObjectId[] = [];

        if (data.scope === "global") {
            const users = await this._userRepository.find({}, { sort: { _id: 1 } });
            userIds = users.map(u => u._id);
        }

        if (data.scope === "role") {
            const users = await this._userRepository.find(
                { role: { $in: data.roles } },
                { sort: { _id: 1 } },
            );
            userIds = users.map(u => u._id);
        }

        if (data.scope === "users") {
            userIds = data.userIds!;
        }

        const recipients = userIds.map(userId => ({
            notificationId: notification._id,
            userId
        }));

        await this._notificationRecipientRepository.insertMany(recipients);
        // send notification through socket
        for(const userId of userIds) {
            emitNotificationToUser(userId.toString(), notification).catch(console.error)
        }

        return mapNotification(notification);
    }

    async updateNotification(notificationId: string, data: Partial<INotification>): Promise<any> {
        
        const notification = await this._notificationRepository.findByIdAndUpdate(
            notificationId,
            data
        );

        if(!notification) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.NOTIFICATION_NOT_FOUND);

        return mapNotification(notification);
    }

    async deleteNotification(notificationId: string): Promise<any> {

        const notification = await this._notificationRepository.findById(notificationId);

        if (!notification) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.NOTIFICATION_NOT_FOUND);
        }

        if (notification.isDeleted) return;

        notification.isDeleted = true;
        notification.deletedAt = new Date();

        await notification.save();
    }

    async getUserNotifications(userId: string, page: number, limit: number): Promise<any> {

        const result = await this._notificationRecipientRepository.getUserNotificationsPaginated(
            userId,
            page,
            limit
        );

        return {
            ...result,
            data: result.data.map(mapUserNotification)
        };
    }

    async markAsRead(notificationId: string, userId: string): Promise<any> {
        
        const notification = await this._notificationRecipientRepository.markAsRead(
            notificationId, userId
        );

        if(!notification) throw createHttpError(HttpStatus.NOT_FOUND, "Notification recipient not found")

        return mapUserNotification(notification)
    }

    async countUnread(userId: string): Promise<number> {

        return await this._notificationRecipientRepository.count({
            userId,
            isRead: false
        });
    }

    async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {

        const result = await this._notificationRecipientRepository.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true }}
        );

        return { modifiedCount: result.modifiedCount }
    }

    async getAdminNotifications(search: string, page: number, limit: number): Promise<any> {

        const filter: FilterQuery<INotificationDocument> = { isDeleted: false }

        if (search && search.trim().length > 0) {
            const regex = new RegExp(search.trim(), "i");

            filter.$or = [
                { subject: regex },
                { message: regex }
            ];
        }

        const result = await this._notificationRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } })

        return {
            ...result,
            data: result.data.map(mapNotification)
        }
    }
}