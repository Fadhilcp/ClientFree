import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { filtersToSearchParams } from '../../utils/filtersToSearchParams';
import { JOB_CATEGORIES } from '../../constants/jobCategories';
import { skillService } from '../../services/skill.service';
import { notify } from '../../utils/toastService';
import SkillsSelect from '../user/profileModal/SkillSelect';
import type { JobSort } from '../../types/filter.type';

type FilterKey =
  | "category"
  | "budgetMin"
  | "budgetMax"
  | "location"
  | "experience"
  | "hourlyRateMin"
  | "hourlyRateMax"
  | "ratingMin"
  | "skills" 
  | "workMode"
  | "sort"
  | "hoursPerDay";

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
    const [experience, setExperience] = useState(
      searchParams.get("experience") || "all"
    );

    const [hourlyRateMin, setHourlyRateMin] = useState(
      searchParams.get("hourlyRateMin") || ""
    );
    const [hourlyRateMax, setHourlyRateMax] = useState(
      searchParams.get("hourlyRateMax") || ""
    );

    const [ratingMin, setRatingMin] = useState(
      searchParams.get("ratingMin") || "all"
    );

    const [workMode, setWorkMode] = useState(
      searchParams.get("workMode") || "all"
    );

    const [sort, setSort] = useState(
      searchParams.get("sort") || "newest"
    );

    const [skills, setSkills] = useState<string[]>(
      searchParams.getAll("skills")
    );

    const [hoursPerDay, setHoursPerDay] = useState(
      searchParams.get("hoursPerDay") || "all"
    );

    const [availableSkills, setAvailableSkills] = useState<any[]>([]);
    const [loadingSkills, setLoadingSkills] = useState(false);

    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const res = await skillService.getActive();
        setAvailableSkills(res.data.skills);
      } catch (error: any) {
        notify.error(
          error.response?.data?.error || "Failed to load skills"
        );
      } finally {
        setLoadingSkills(false);
      }
    };

    React.useEffect(() => {
      if (has("skills")) {
        fetchSkills();
      }
    }, []);

    const applyFilters = () => {

      const params = filtersToSearchParams({
        ...(has("category") && category !== "all" ? { category } : {}),
        ...(has("budgetMin") && budgetMin ? { budgetMin: Number(budgetMin) } : {}),
        ...(has("budgetMax") && budgetMax ? { budgetMax: Number(budgetMax) } : {}),
        ...(has("location") && location.trim() ? { location: location.trim() } : {}),
        ...(has("experience") && experience !== "all" ? { experience } : {}),

        ...(has("hourlyRateMin") && hourlyRateMin
          ? { hourlyRateMin: Number(hourlyRateMin) }
          : {}),
        ...(has("hourlyRateMax") && hourlyRateMax
          ? { hourlyRateMax: Number(hourlyRateMax) }
          : {}),

        ...(has("ratingMin") && ratingMin !== "all"
          ? { ratingMin: Number(ratingMin) }
          : {}),

        ...(has("workMode") && workMode !== "all"
          ? { workMode: workMode as "fixed" | "hourly" }
          : {}),

        ...(has("skills") && skills.length > 0
          ? { skills }
          : {}),

        ...(has("hoursPerDay") && hoursPerDay !== "all"
          ? { hoursPerDay: Number(hoursPerDay) }
          : {}),

        ...(sort ? { sort: sort as JobSort } : {}),
      });

      params.delete("cursor");
      setSearchParams(params);
    };

  return (
      <aside className="md:flex md:w-60 lg:w-72 md:flex-shrink-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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

            {has("hoursPerDay") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hours per Day
                </label>

                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                >
                  <option value="all">Any</option>
                  <option value="1">1 hour/day</option>
                  <option value="2">2 hours/day</option>
                  <option value="4">4 hours/day</option>
                  <option value="8">Full time (8h)</option>
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

            {/* Budget Sorting */}
            {has("sort") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort Jobs
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                >
                  <option value="newest">Newest</option>
                  <option value="budget_desc">High → Low</option>
                  <option value="budget_asc">Low → High</option>
                </select>
              </div>
            )}
            
            {/* experience */}
            {has("experience") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                >
                  <option value="all">All</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            )}

            {(has("hourlyRateMin") || has("hourlyRateMax")) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hourly Rate
                </label>
                <div className="flex gap-2">
                  {has("hourlyRateMin") && (
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={hourlyRateMin}
                      onChange={(e) => setHourlyRateMin(e.target.value)}
                      className="w-1/2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                    />
                  )}
                  {has("hourlyRateMax") && (
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={hourlyRateMax}
                      onChange={(e) => setHourlyRateMax(e.target.value)}
                      className="w-1/2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                    />
                  )}
                </div>
              </div>
            )}

            {has("ratingMin") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating
                </label>
                <select
                  value={ratingMin}
                  onChange={(e) => setRatingMin(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                >
                  <option value="all">Any</option>
                  <option value="4">4★ & up</option>
                  <option value="3">3★ & up</option>
                </select>
              </div>
            )}
            
            {/* Work Mode */}
            {has("workMode") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Mode
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-white dark:text-gray-200"
                >
                  <option value="all">All</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            )}

            {/* Skills */}
            {has("skills") && (
              <div>

                <SkillsSelect
                  value={skills}
                  onChange={(selected) => setSkills(selected)}
                  options={availableSkills}
                  error={undefined}
                />

                {loadingSkills && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading skills...
                  </p>
                )}
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