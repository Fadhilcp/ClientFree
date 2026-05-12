export const JOB_FIELDS = [
  { name: "title", label: "Job Title", placeholder: "Enter job title" },
  { name: "paymentBudget", label: "Budget", placeholder: "Enter budget" },
  { name: "hoursPerDay", label: "Hours Per Day", placeholder: "Example: 2" },
];

export const JOB_DROPDOWNS = [
  {
    name: "visibility",
    label: "Visibility",
    options: ["public", "private"],
  },
  {
    name: "category",
    label: "Category",
    options: [],
  },
  {
    name: "subcategory",
    label: "Subcategory",
    options: [],
  },
  {
    name: "paymentType",
    label: "Payment Type",
    options: ["fixed", "hourly"],
  },
  {
    name: "locationType",
    label: "Location Preference",
    options: ["specific", "worldwide"],
  },
];

export const JOB_TEXTAREAS = [
  {
    name: "description",
    label: "Job Description",
    placeholder: "Describe the job requirements...",
    rows: 5,
  },
];

export const JOB_DATE_FIELDS = [
  { name: "duration", label: "Duration" }
];