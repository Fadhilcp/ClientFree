
const Pagination = ({ page, totalPages, onPageChange }: {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}) => (
  <div className="flex justify-end mt-4 gap-2">
    <button
      disabled={page === 1}
      onClick={() => onPageChange(page - 1)}
      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
    >
      Prev
    </button>
    <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
      Page {page} of {totalPages}
    </span>
    <button
      disabled={page === totalPages}
      onClick={() => onPageChange(page + 1)}
      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

export default Pagination