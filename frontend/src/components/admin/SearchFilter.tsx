import React from 'react';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
};

const SearchFilter: React.FC<Props> = ({
  search,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => (
<div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
  {/* Search Input */}
  <input
    type="text"
    value={search}
    onChange={(e) => onSearchChange(e.target.value)}
    placeholder="Search by name, email, or role"
    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full sm:w-[28rem] bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
  />

  {/* Date Range Inputs */}
  {startDate !== undefined && endDate !== undefined && (
  <div className="flex gap-4 ml-auto">
    <input
      type="date"
      value={startDate}
      onChange={(e) => onStartDateChange?.(e.target.value)}
      className="..."
    />
    <input
      type="date"
      value={endDate}
      onChange={(e) => onEndDateChange?.(e.target.value)}
      className="..."
    />
  </div>
)}

</div>
);

export default SearchFilter;