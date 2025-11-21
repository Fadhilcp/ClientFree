import type { JobForm } from "../../types/job/job.dto";

export const validateJobForm = (data: JobForm) => {
  const newErrors: Partial<Record<keyof JobForm, string>> = {};

  if (!data.title.trim()) newErrors.title = "Title is required";
  if (!data.category.trim()) newErrors.category = "Category is required";
  if (!data.subcategory.trim()) newErrors.subcategory = "Subcategory is required";

  if (!data.paymentBudget.trim()) newErrors.paymentBudget = "Budget is required";

  if (!data.description.trim()) newErrors.description = "Description is required";

  if (!data.duration.trim()) newErrors.duration = "Duration is required";

  // Location fields — only when specific
  if (data.locationType === "specific") {
    if (!data.locationCity.trim()) newErrors.locationCity = "City is required";
    if (!data.locationCountry.trim()) newErrors.locationCountry = "Country is required";
  }

  return newErrors;
};
