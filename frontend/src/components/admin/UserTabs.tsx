import React from 'react';

export type Tab =
  | 'All'
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'Admin'
  | 'Client'
  | 'Freelancer'
  | 'Premium';

type Props = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

const tabs: Tab[] = [
  'All',
  'Active',
  'Inactive',
  'Suspended',
  'Admin',
  'Client',
  'Freelancer',
  'Premium',
];

const UserTabs: React.FC<Props> = ({ activeTab, onChange }) => (
  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-2 mb-4 rounded-md">
  <div className="flex flex-wrap gap-3">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          activeTab === tab
            ? 'bg-blue-100 text-indigo-600 dark:bg-indigo-600 dark:text-white'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        {tab} Users
      </button>
    ))}
  </div>
</div>

);

export default UserTabs;