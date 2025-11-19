import React from "react";
import SettingSidebar from "../../components/user/settings/SettingSideBar";
import { Outlet } from "react-router-dom";

const SettingsLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar OR Dropdown */}
      <SettingSidebar />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto text-indigo-600 dark:text-indigo-500">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingsLayout;