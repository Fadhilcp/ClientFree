import React from "react";
import type { NotificationDTO } from "../../../types/notification.type";

interface Props {
  notifications: NotificationDTO[];
  onRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationList: React.FC<Props> = ({ notifications, onRead, markAllAsRead }) => {

return (
  <ul className=" bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    {/* Header */}
      <li className="flex items-center justify-between px-4 pb-2">
        <span className="text-xs text-indigo-500 dark:text-indigo-400 tracking-wide font-semibold">
          Notifications
        </span>
        <button
          onClick={markAllAsRead}
          className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline font-medium"
        >
          Mark all as read
        </button>
      </li>


    {notifications.map((n) => (
      <li
        key={n.id}
        className={`p-4 ${!n.isRead ? "bg-indigo-100 dark:bg-blue-900/20" : ""}`}  
        onClick={() => onRead?.(n.id)}
      >
        {/* Content */}
        <div className="flex-1 space-y-2">
          <div
            className={`text-sm ${
              !n.isRead
                ? "font-semibold text-indigo-600 dark:text-indigo-500"
                : "text-gray-800 dark:text-gray-200"
            }`}          >
            {n.subject}
          </div>
          <div className="text-xs uppercase font-semibold text-indigo-600 dark:text-indigo-500">
            {n.category.replace("_"," ") ?? "Notification"}
          </div>

          {/* Full message, no truncation */}
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-normal break-words leading-relaxed">
            {n.message}
          </p>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>

      </li>
    ))}

    {/* Empty state */}
    {notifications.length === 0 && (
      <li className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        You have no notifications
      </li>
    )}
  </ul>
);

};

export default NotificationList;
