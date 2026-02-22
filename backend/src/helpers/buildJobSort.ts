import { JobSort } from "../types/filter.type";

// reusable sort function in every job listing
export function buildJobSort(sort: JobSort): Record<string, 1 | -1> {
  switch (sort) {
    case "budget_asc":
      return { "payment.budget": 1, _id: -1 };
    case "budget_desc":
      return { "payment.budget": -1, _id: -1 };
    case "newest":
    default:
      return { _id: -1 };
  }
}