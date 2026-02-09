import { useState } from "react";

interface JobHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { key: string; label: string }[];
  status: string;
  onBack: () => void;
  isJobOwner?: boolean;
  onCancelJob?: () => void;
  onDeleteJob?: () => void;
}

const JobHeader: React.FC<JobHeaderProps> = ({
   activeTab, setActiveTab, tabs, status, onBack, isJobOwner, onCancelJob, onDeleteJob
  }) => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const handleMenuToggle = () => setMenuOpen((prev) => !prev);

    const closeMenu = () => setMenuOpen(false);
  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between 
                    border-b border-gray-200 dark:border-gray-700 
                    px-4 sm:px-6 py-3 sm:py-4 
                    bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 gap-3 sm:gap-0">

      {/* Back Button */}
      <div className="flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg 
                    bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 
                    hover:bg-gray-200 dark:hover:bg-gray-600 
                    transition-colors duration-200 shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === tab.key
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border-b-2 border-indigo-600"
                : "text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status + Menu */}
      <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-3 sm:justify-end">
        {/* Status badge */}
        <span
          className={`px-3 py-1.5 text-sm font-semibold shadow-sm transition-colors duration-200 
                      rounded-md sm:rounded-full w-80 sm:w-auto text-center
                      ${
                        status === "open"
                          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                          : status === "completed"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                          : status === "cancelled"
                          ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                      }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>

        {/* Menu button */}
        {isJobOwner && status === "open" && (
          <div className="absolute right-4 top-3 sm:static">
            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-full hover:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200"
            >
              <i className="fa-solid fa-ellipsis-vertical dark:text-gray-100 text-gray-800"></i>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-20">
                {onCancelJob && (
                  <button
                    onClick={() => {
                      onCancelJob();
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Cancel Job
                  </button>
                )}
                {onDeleteJob && (
                  <button
                    onClick={() => {
                      onDeleteJob();
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Delete Job
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobHeader;