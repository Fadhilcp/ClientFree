import React, { useEffect, useState } from "react";
import NotificationList from "../../../components/user/Notification/NotificationList";
import { useNotifications } from "../../../context/NotificationContext";
import type { NotificationDTO } from "../../../types/notification.type";
import { notificationService } from "../../../services/notification.service";
import { notify } from "../../../utils/toastService";
import Pagination from "../../../components/user/Pagination";

const LIMIT = 10; 

const NotificationsPage: React.FC = () => {
    const { markRead, markAllRead } = useNotifications();

    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async (currentPage: number) => {
        try {
            setLoading(true);
            const res = await notificationService.getMyNotifications(currentPage, LIMIT);

            if (res.data.success) {
                const { notifications } = res.data

                setNotifications(notifications.data);
                setTotalPages(notifications.totalPages);
                setTotal(notifications.total);
            }
        } catch (error){
            notify.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(page);
    }, [page]);

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <div className="w-full max-w-2xl">
            {/* Page Title */}
            <h1 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-500 text-center">
                Notifications
            </h1>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg py-4 ">
                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-10">
                        <span className="text-gray-500 dark:text-gray-400">
                        Loading notifications...
                        </span>
                    </div>
                )}

                {/* Empty state */}
                {!loading && notifications.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No notifications found
                    </div>
                )}

                {/* List */}
                {!loading && notifications.length > 0 && (
                    <NotificationList
                        notifications={notifications}
                        onRead={markRead}
                        markAllAsRead={markAllRead}
                    />
                )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            entityLabel="notifications"
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;