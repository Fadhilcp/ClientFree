import React from "react";

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface ReusableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  onEdit?: (row: T) => void;
}

const ReusableTable = <T extends object>({
  columns,
  data,
  title,
  onEdit,
}: ReusableTableProps<T>) => {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
  {title && (
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 px-4 pt-4">
      {title}
    </h2>
  )}
  <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
    <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
      <tr>
        {columns.map((col) => (
          <th key={String(col.key)} scope="col" className="px-3 text-center py-3">
            {col.header}
          </th>
        ))}
        {onEdit && <th scope="col" className="px-3 py-3">Action</th>}
      </tr>
    </thead>
    <tbody>
      {data.map((row, index) => (
        <tr
          key={index}
          className={`${
            index % 2 === 0
              ? 'bg-white dark:bg-gray-900'
              : 'bg-gray-50 dark:bg-gray-800'
          } border-b border-gray-200 dark:border-gray-700`}
        >
          {columns.map((col) => (
            <td
              key={String(col.key)}
              className="px-3 py-3 text-center font-extralight text-gray-800 dark:text-gray-100 whitespace-nowrap"
            >
              {col.render
                ? col.render((row as any)[col.key], row)
                : (row as any)[col.key]}
            </td>
          ))}
          {onEdit && (
            <td className="px-6 py-4">
              <button
                onClick={() => onEdit(row)}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit
              </button>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
};

export default ReusableTable;