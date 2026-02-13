import type { JobForm } from "../../types/job/job.dto";

export const validateJobForm = (data: JobForm) => {
  const errors: Partial<Record<keyof JobForm, string>> = {};

  const isEmpty = (v: unknown) =>
    typeof v === "string" ? v.trim().length === 0 : v === null || v === undefined;

  const isNumeric = (v: unknown) =>
    typeof v === "number"
      ? !isNaN(v)
      : typeof v === "string"
      ? /^[0-9]+(\.[0-9]+)?$/.test(v.trim())
      : false;

  const MAX_TITLE_LENGTH = 50;

  if (isEmpty(data.title)) {
    errors.title = "Title is required";
  } else if (data.title.trim().length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be at most ${MAX_TITLE_LENGTH} characters`;
  }

  if (isEmpty(data.category)) {
    errors.category = "Category is required";
  }
  if (isEmpty(data.subcategory)) {
    errors.subcategory = "Subcategory is required";
  }
  if (isEmpty(data.paymentBudget)) {
    errors.paymentBudget = "Budget is required";
  } else if (!isNumeric(data.paymentBudget)) {
    errors.paymentBudget = "Budget must be a number";
  }
  if (isEmpty(data.description)) {
    errors.description = "Description is required";
  } else if (data.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters";
  }
  if (isEmpty(data.duration)) {
    errors.duration = "Duration is required";
  }
  // location only when type specific
  if (data.locationType === "specific") {
    if (isEmpty(data.locationCity)) {
      errors.locationCity = "City is required";
    }
    if (isEmpty(data.locationCountry)) {
      errors.locationCountry = "Country is required";
    }
  }

  return errors;
};
