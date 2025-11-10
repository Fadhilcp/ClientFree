import React from 'react';

const AdminNavbar: React.FC = () => {
  return (
    <header className="w-full h-16 px-6 flex items-center justify-end border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <img
          src="/images/avatar/admin.png" 
          alt="Admin Avatar"
          className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-600"
        />

        {/* Username */}
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
          Admin Username
        </span>
      </div>
    </header>
  );
};

export default AdminNavbar;