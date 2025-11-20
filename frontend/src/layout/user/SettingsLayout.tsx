import React from "react";
import Sidebar from "../../components/ui/SideBar";
import { Outlet } from "react-router-dom";

const settingsMenu = [
  { label: "Account & Security", path: "/settings/account-security" },
  { label: "Subscription & Premium", path: "/settings/subscription-premium" },
  { label: "Payment Methods", path: "/settings/payment-methods" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "Role & Permissions", path: "/settings/roles-permissions" },
];

const SettingsLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar OR Dropdown */}
      <Sidebar items={settingsMenu} />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto text-indigo-600 dark:text-indigo-500">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingsLayout;