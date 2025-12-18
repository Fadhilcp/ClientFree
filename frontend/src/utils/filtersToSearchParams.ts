import type { FreelancerFilters } from "../types/filter.type";

export function filtersToSearchParams(filters: FreelancerFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.budgetMin !== undefined) params.set("budgetMin", String(filters.budgetMin));
  if (filters.budgetMax !== undefined) params.set("budgetMax", String(filters.budgetMax));
  if (filters.location) params.set("location", filters.location);
  if (filters.experience) params.set("experience", filters.experience);
  if (filters.hourlyRateMin !== undefined) params.set("hourlyRateMin", String(filters.hourlyRateMin));
  if (filters.hourlyRateMax !== undefined) params.set("hourlyRateMax", String(filters.hourlyRateMax));
  if (filters.ratingMin !== undefined) params.set("ratingMin", String(filters.ratingMin));

  return params;
}
