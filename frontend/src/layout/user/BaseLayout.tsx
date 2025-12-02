import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/ui/SideBar";

interface BaseLayoutProps {
  menuItems: { label: string; path: string }[];
  filterBox: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ menuItems, filterBox }) => {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 h-screen">
        <Sidebar items={menuItems} />
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto text-gray-800 dark:text-gray-200">
        <Outlet />
      </main>

      {/* Filter box */}
      <aside className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0 h-screen p-6">
        {filterBox}
      </aside>
    </div>
  );
};

export default BaseLayout;