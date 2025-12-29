import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  entityLabel?: string; 
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  entityLabel = "items",
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between mt-6">
      {/* Info */}
      <span className="text-sm text-gray-600 dark:text-gray-300">
        Page <span className="font-semibold">{page}</span> of{" "}
        <span className="font-semibold">{totalPages}</span> • Total{" "}
        <span className="font-semibold">{total}</span> {entityLabel}
      </span>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                     hover:bg-indigo-50 dark:hover:bg-gray-700 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-colors duration-200"
        >
          <i className="fa-solid fa-angle-left"></i>
        </button>

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                     hover:bg-indigo-50 dark:hover:bg-gray-700 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-colors duration-200"
        >
          <i className="fa-solid fa-angle-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;