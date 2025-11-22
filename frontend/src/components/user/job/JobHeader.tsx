interface JobHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { key: string; label: string }[];
  status: string;
  onBack: () => void;
}

const JobHeader: React.FC<JobHeaderProps> = ({ activeTab, setActiveTab, tabs, status, onBack }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <button onClick={onBack} className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm font-medium ${
              activeTab === tab.key
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                : "text-gray-600 dark:text-gray-300"
            } pb-1`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <span className={`px-3 py-1 text-sm rounded ${
        status === "open"
          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
          : status === "completed"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
          : status === "cancelled"
          ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
      }`}>
        {status}
      </span>
    </div>
  );
};

export default JobHeader;