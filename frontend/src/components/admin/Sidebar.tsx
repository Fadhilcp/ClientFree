import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div
      id="sidebar"
      className="lg:block lg:translate-x-0 w-64 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 left-0 bottom-0 z-60 bg-white border-e border-gray-200 dark:bg-gray-900 dark:border-gray-700"
      role="dialog"
      tabIndex={-1}
      aria-label="Sidebar"
    >
      <div className="relative flex flex-col h-full max-h-full">
        {/* Header */}
        <header className="p-4 flex justify-between items-center gap-x-2">
          <a
            className="flex-none font-semibold text-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:opacity-80"
            href="#"
            aria-label="Brand"
          >
            ClientFree
          </a>
        </header>

        {/* Body */}
        <nav className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600">
          <div className="pb-0 px-2 w-full flex flex-col flex-wrap">
            <ul className="space-y-1">
              {/* Users */}
              <li>
                <a
                  href="/admin/users"
                  className="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:text-gray-100"
                >
                  <svg
                    className="size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Users
                </a>
              </li>

              {/* Skills */}
              <li>
                <a
                  href="/admin/skills"
                  className="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:text-gray-100"
                >
                  <svg
                    className="size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l4 4-4 4-4-4z" />
                    <path d="M2 12l4 4-4 4-4-4z" />
                    <path d="M22 12l-4 4 4 4 4-4z" />
                  </svg>
                  Skills
                </a>
              </li>

              
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;