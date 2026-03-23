export type JobSort = "newest" | "budget_asc" | "budget_desc";

export interface JobFilters {
    category?: string;
    budgetMin?: number;
    budgetMax?: number;
    hoursPerDay?: number;
    location?: string;
    workMode?: "fixed" | "hourly";
    skills?: string[];
}