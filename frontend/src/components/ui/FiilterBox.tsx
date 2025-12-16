import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { filtersToSearchParams } from '../../utils/filtersToSearchParams';
import { JOB_CATEGORIES } from '../../constants/jobCategories';

type FilterKey = "category" | "budgetMin" | "budgetMax" | "location";

type FilterBoxProps = {
  enabledFilters: FilterKey[];
};


const FiilterBox: React.FC<FilterBoxProps> = ({ enabledFilters = [] }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const has = (key: FilterKey) => enabledFilters.includes(key);

    const [category, setCategory] = useState(searchParams.get("category") || "all");
    const [budgetMin, setBudgetMin] = useState<string>(searchParams.get("budgetMin") || "");
    const [budgetMax, setBudgetMax] = useState<string>(searchParams.get("budgetMax") || "");
    const [location, setLocation] = useState(searchParams.get("location") || "");

    const applyFilters = () => {

      const params = filtersToSearchParams({
        ...(has("category") && category !== "all" ? { category } : {}),
        ...(has("budgetMin") && budgetMin ? { budgetMin: Number(budgetMin) } : {}),
        ...(has("budgetMax") && budgetMax ? { budgetMax: Number(budgetMax) } : {}),
        ...(has("location") && location.trim() ? { location: location.trim() } : {}),
      });

      params.delete("cursor");
      setSearchParams(params);
    };

  return (
      <aside className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0 h-screen max-w-3xs">
        <div className="rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 p-6">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-filter text-indigo-500"></i> Filters
          </h2>

          <div className="space-y-6">
            {/* Category */}
            {has("category") &&(
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                  <option value="all">All</option>
                  {JOB_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Budget Range */}
            {(has("budgetMin") || has("budgetMax")) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget Range
                </label>
                <div className="flex gap-2">
                  {has("budgetMin") && (
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="w-1/2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                    />
                  )}
                  {has("budgetMax") && (
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-1/2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {has("location") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                  type="text"
                  placeholder="Enter city/country"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            )}
            {/* Divider */}
            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Apply Button */}
            <button onClick={applyFilters}
            className="w-full rounded-md bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-indigo-500 hover:to-indigo-400 transition-transform transform hover:scale-[1.02]">
              Apply Filters
            </button>
          </div>
        </div>
      </aside>
  )
}

export default FiilterBox