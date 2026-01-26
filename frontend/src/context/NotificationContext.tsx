import React, { createContext, useContext, useEffect, useState } from "react";
import type { NotificationDTO } from "../types/notification.type";
import { notificationService } from "../services/notification.service";
import { socket } from "../config/socket.config";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

type NotificationContextType = {
  latestNotifications: NotificationDTO[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
};

const MAX_LATEST = 10;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [latestNotifications, setLatestNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    const res = await notificationService.getMyNotifications(1, MAX_LATEST);
    console.log("🚀 ~ fetchNotifications ~ res:", res)
    if (res.data.success) {
        const { notifications } = res.data;
        setLatestNotifications(notifications.data || []);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    const res = await notificationService.getUnreadCount();
    if (res.data.success) {
      setUnreadCount(res.data.unreadCount);
    }
  };


  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();
    fetchUnreadCount();
  }, [user?.id]);

  useEffect(() => {
    const onNew = (notification: NotificationDTO) => {
      setLatestNotifications(prev => {
        if (prev.some(n => n.id === notification.id)) return prev;
        return [notification, ...prev].slice(0, MAX_LATEST);
      });
      setUnreadCount(prev => prev + 1);
    };

    socket.on("notification:new", onNew);
    return () => {
        socket.off("notification:new", onNew)
    };
  }, [user?.id]);

  const markRead = (id: string) => {
    setLatestNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(prev - 1, 0));
    notificationService.markNotificationAsRead(id);
  };

  const markAllRead = () => {
    setLatestNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
    notificationService.markAllAsRead();
  };
  // fetch notifications when the tab regains focus, socket is not guaranteed
  useEffect(() => {
    const onFocus = () => {
        fetchNotifications();
        fetchUnreadCount();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        latestNotifications,
        unreadCount,
        markRead,
        markAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};