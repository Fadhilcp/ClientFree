import { INotification } from "types/notification.type";

export interface INotificationService { 
    createNotification(data: INotification): Promise<any>;
    updateNotification(notificationId: string, data: Partial<INotification>): Promise<any>;
    deleteNotification(notificationId: string): Promise<any>;
    getUserNotifications(userId: string, page: number, limit: number): Promise<any>;
    markAsRead(notificationId: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<{ modifiedCount: number }>;
    countUnread(userId: string): Promise<number>;
    getAdminNotifications(search: string, page: number, limit: number): Promise<any>;
}