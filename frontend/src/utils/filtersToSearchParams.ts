import type { FreelancerFilters } from "../types/filter.type";

export function filtersToSearchParams(filters: FreelancerFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.budgetMin !== undefined) params.set("budgetMin", String(filters.budgetMin));
  if (filters.budgetMax !== undefined) params.set("budgetMax", String(filters.budgetMax));
  if (filters.location) params.set("location", filters.location);

  return params;
}
