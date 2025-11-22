import type { JobDetailDTO } from "../../../types/job/job.dto";

const JobDetails: React.FC<{ job: JobDetailDTO }> = ({ job }) => (
  <div className="px-6 py-6 space-y-4">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{job.title}</h1>
    <p className="text-sm text-gray-600 dark:text-gray-400">{job.category} • {job.subcategory}</p>

    <div className="flex flex-wrap gap-2">
      {job.skills?.map((skill, i) => (
        <span key={i} className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {skill.name}
        </span>
      ))}
    </div>

    {job.locationPreference && (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        📍 Location: {job.locationPreference.type === "worldwide"
          ? "Worldwide"
          : `${job.locationPreference.city || ""}, ${job.locationPreference.country || ""}`}
      </p>
    )}

    <p className="text-gray-700 dark:text-gray-300">{job.description}</p>

    {job.payment && (
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
        Budget: {job.payment.budget ?? "N/A"} ({job.payment.type})
      </p>
    )}

    <p className="text-xs text-gray-500 dark:text-gray-400">
      Created: {new Date(job.createdAt).toLocaleDateString()} • Duration: {job.duration ?? "N/A"}
    </p>

    <p className="text-xs text-gray-500 dark:text-gray-400">
      Proposals: {job.proposalCount} • Featured: {job.isFeatured ? "Yes" : "No"}
    </p>
  </div>
);

export default JobDetails;