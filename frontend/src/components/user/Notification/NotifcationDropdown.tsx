import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/NotificationContext";


interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {

    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { markRead, markAllRead, latestNotifications } = useNotifications();

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            onClose();
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 pt-3 w-[410px] 
             max-h-[500px] bg-white dark:bg-gray-800 rounded-lg 
             shadow-lg overflow-y-auto no-scrollbar z-50" 
    >
      {/* Actions */}


      {latestNotifications.length > 0 && (
        <div className="flex items-center justify-end px-4 mb-2">
          <p
            onClick={markAllRead}
            className="text-xs text-indigo-600 dark:text-indigo-500 font-medium cursor-pointer hover:underline"
            >
            Mark all as read
          </p>
        </div>
      )}

      {latestNotifications.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">
          No notifications yet
        </p>
      )}

      {/* Notifications */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {latestNotifications.map((n) => (
          <li
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`p-4 cursor-pointer transition
              ${!n.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""}
              hover:bg-gray-50 dark:hover:bg-gray-700`}
          >
            <div className="ml-6">
              <h3 className="text-sm text-slate-900 dark:text-slate-100 font-medium">{n.subject}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 line-clamp-2">
                {n.message}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <p 
      onClick={() => {
        onClose();
        navigate("/notifications");
      }}
      className="text-xs px-4 mt-6 mb-4 inline-block text-blue-600 dark:text-blue-400 font-medium cursor-pointer">
        View all Notifications
      </p>
    </div>
  );
};

export default NotificationDropdown;