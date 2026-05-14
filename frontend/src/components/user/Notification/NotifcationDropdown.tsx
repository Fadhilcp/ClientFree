import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/NotificationContext";
import { Bell, CheckCheck, Mail, ArrowRight } from "lucide-react";

interface NotificationDropdownProps {
  isOpen: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { markRead, markAllRead, latestNotifications } = useNotifications();



  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 w-[380px] max-h-[520px] 
                 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl 
                 border border-slate-200 dark:border-slate-800 
                 flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
        {latestNotifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:opacity-80 transition"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1 no-scrollbar max-h-[400px]">
        {latestNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3">
              <Bell className="text-slate-400" size={24} />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No new notifications at the moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {latestNotifications.map((n) => (
              <li
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`group p-4 cursor-pointer transition-colors relative
                  ${!n.isRead ? "bg-indigo-50/30 dark:bg-indigo-500/5" : ""}
                  hover:bg-slate-50 dark:hover:bg-slate-800/50`}
              >
                <div className="flex gap-3">
                  {/* Status Dot & Icon */}
                  <div className="relative">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition">
                      <Mail size={16} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    {!n.isRead && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`text-sm leading-none ${!n.isRead ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                      {n.subject}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div 
        onClick={() => {
          navigate("/notifications");
        }}
        className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 group cursor-pointer"
      >
        <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
          View all Notifications
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;