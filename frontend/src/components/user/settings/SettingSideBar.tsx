import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Account & Security", path: "/settings/account-security" },
  { label: "Subscription & Premium", path: "/settings/subscription-premium" },
  { label: "Payment Methods", path: "/settings/payment-methods" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "Role & Permissions", path: "/settings/roles-permissions" },
];

const SettingSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-54 bg-gray-100 dark:bg-gray-800 p-4 border-r border-indigo-500">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
        Menu
      </h2>

      <ul className="space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <li
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-2 block text-sm rounded cursor-pointer transition-colors ${
                isActive
                  ? "bg-indigo-100 text-indigo-600 font-medium dark:bg-indigo-500 dark:text-white"
                  : "hover:bg-gray-200 text-gray-800 dark:hover:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {item.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SettingSidebar;