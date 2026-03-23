export type JobSort = "newest" | "budget_asc" | "budget_desc";

export interface FreelancerFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;

  experience?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  ratingMin?: number;
  hoursPerDay?: number;

  workMode?: "fixed" | "hourly" | "all";
  skills?: string[];
  sort?: JobSort;
}
