import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/ui/SideBar";

interface BaseLayoutProps {
  menuItems: { label: string; path: string }[];
  filterBox?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ menuItems, filterBox }) => {

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 md:sticky md:top-0 md:h-screen">
        <Sidebar items={menuItems} />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-4 md:p-8 overflow-y-auto text-gray-800 dark:text-gray-200">
      {filterBox && (
        <div className="md:hidden mb-4 flex justify-end">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm
                       rounded-md bg-white dark:bg-gray-800"
          >
            <i className="fa-solid fa-filter text-indigo-500" />
            Filters
          </button>
        </div>
      )}

        <Outlet />
      </main>
{filterBox && (
  <div
    className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
      showMobileFilter ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
    onClick={() => setShowMobileFilter(false)}
  >
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/40" />

    {/* Sliding panel */}
    <div
      className={`absolute right-0 top-0 h-full w-full max-w-xs no-scrollbar
                  bg-white dark:bg-gray-900 p-4 overflow-y-auto
                  transform transition-transform duration-300 ease-in-out
                  ${showMobileFilter ? "translate-x-0" : "translate-x-full"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
          Filters
        </h3>
        <button
          onClick={() => setShowMobileFilter(false)}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <i className="fa-solid fa-xmark text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      {filterBox}
    </div>
  </div>
)}


      {/* Filter box */}
      {filterBox && (
        <aside
          className="hidden md:block border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-900 md:sticky md:top-0 md:h-screen p-6"
        >
          {filterBox}
        </aside>
      )}
    </div>
  );
};

export default BaseLayout;