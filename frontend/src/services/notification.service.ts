import { endPoints } from "../config/endpoints";
import axios from "../lib/axios";

class NotificationService {

    getMyNotifications(page: number, limit: number){
        return axios.get(endPoints.NOTIFICATION.GET_MY(page, limit));
    }

    createNotification(data: any){
        return axios.post(endPoints.NOTIFICATION.CREATE, data);
    }

    updateNotification(notificationId: string, data: any){
        return axios.put(endPoints.NOTIFICATION.UPDATE(notificationId), data);
    }

    deleteNotification(notificationId: string){
        return axios.delete(endPoints.NOTIFICATION.DELETE(notificationId));
    }

    markNotificationAsRead(notificationId: string){
        return axios.patch(endPoints.NOTIFICATION.MARK_READ(notificationId));
    }

    getUnreadCount(){
        return axios.get(endPoints.NOTIFICATION.COUNT_UNREAD);
    }

    markAllAsRead(){
        return axios.patch(endPoints.NOTIFICATION.MARK_ALL_READ);
    }

    getAdminNotifications(search: string, page: number, limit: number) {
        return axios.get(endPoints.NOTIFICATION.GET_ADMIN(search, page, limit));
    }
}

export const notificationService = new NotificationService();