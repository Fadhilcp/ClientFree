import React from "react";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface ListWithHeaderProps<T> {
  title: string;
  items: T[];
  columns: Column<T>[];
}

function ListWithHeader<T extends { id: string }>({ title, items, columns }: ListWithHeaderProps<T>) {
  return (
    <div className="">
      {/* Header */}
      <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
        {title}
      </h3>

      {/* Table-like list */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 rounded-t-lg">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-200 first:rounded-tl-lg last:rounded-tr-lg"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-3 py-2 text-center align-middle text-gray-800 dark:text-gray-200"
                  >
                    {col.render
                      ? col.render(item[col.key], item)
                      : (item[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div> 
  );
}

export default ListWithHeader;