import { AdminNotificationDTO, CreateNotificationDTO, NotificationDTO } from "dtos/notification.dto";
import { INotification } from "types/notification.type";
import { PaginatedResult } from "types/pagination";

export interface INotificationService { 
    createNotification(data: CreateNotificationDTO): Promise<AdminNotificationDTO>;
    updateNotification(notificationId: string, data: Partial<INotification>): Promise<AdminNotificationDTO>;
    deleteNotification(notificationId: string): Promise<void>;
    getUserNotifications(userId: string, page: number, limit: number): Promise<PaginatedResult<NotificationDTO>>;
    markAsRead(notificationId: string, userId: string): Promise<NotificationDTO>;
    markAllAsRead(userId: string): Promise<{ modifiedCount: number }>;
    countUnread(userId: string): Promise<number>;
    getAdminNotifications(search: string, page: number, limit: number): Promise<PaginatedResult<AdminNotificationDTO>>;
}