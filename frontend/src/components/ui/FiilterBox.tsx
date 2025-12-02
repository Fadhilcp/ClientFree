import React from 'react'

const FiilterBox: React.FC = () => {
  return (
      <aside className=" border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0 h-screen">
        <div className="rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-filter text-indigo-500"></i> Filters
          </h2>

          <div className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                <option>All</option>
                <option>Web Development</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Budget Range
              </label>
              <input
                type="text"
                placeholder="e.g. 100 - 500"
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city/country"
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Divider */}
            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Apply Button */}
            <button className="w-full rounded-md bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-indigo-500 hover:to-indigo-400 transition-transform transform hover:scale-[1.02]">
              Apply Filters
            </button>
          </div>
        </div>
      </aside>
  )
}

export default FiilterBox