
type Props<T extends string> = {
  tabs: T[];
  activeTab: T;
  onChange: (tab: T) => void;
  labelSuffix?: string;
};

const FilterTabs = <T extends string>({
  tabs,
  activeTab,
  onChange,
  labelSuffix = '',
}: Props<T>) => (
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
          {tab} {labelSuffix}
        </button>
      ))}
    </div>
  </div>
);

export default FilterTabs;