export interface FreelancerFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;

  experience?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  ratingMin?: number;

  workMode?: "fixed" | "hourly" | "all";
  skills?: string[];
}
