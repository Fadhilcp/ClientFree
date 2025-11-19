import React, { useState, useRef, useEffect } from "react";
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
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    menuItems.find((item) => item.path === location.pathname)?.label ||
    "Select Menu";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Sidebar for desktop */}
      <div className="hidden md:block w-54 bg-gray-100 dark:bg-gray-800 p-4 border-r border-indigo-500">
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

      {/* Dropdown for mobile */}
      <div className="md:hidden w-full p-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex justify-between items-center text-sm px-3 py-2 rounded-md border border-gray-300 
                       dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {currentLabel}
            <span className="text-gray-500 dark:text-gray-300">
              <i
                className={`fas ${
                  open ? "fa-chevron-up" : "fa-chevron-down"
                } text-gray-800 dark:text-gray-200 text-sm`}
              />
            </span>
          </button>

          {open && (
            <ul className="absolute mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 z-20">
              {menuItems.map((item) => (
                <li
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors 
                    ${
                      location.pathname === item.path
                        ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500 dark:text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                    }`}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingSidebar;