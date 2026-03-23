import type { JobDetailDTO } from "../../../types/job/job.dto";
import VerifiedBadge from "../../ui/VerifiedBadge";

const JobDetails: React.FC<{ job: JobDetailDTO }> = ({ job }) => {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 space-y-6 bg-white dark:bg-gray-800">
      {/* Title */}
      <h1 className="flex flex-wrap items-center gap-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        <span>{job.title}</span>
        <span className="translate-y-1">
          {job.isVerified && <VerifiedBadge size={30} />}
        </span>
      </h1>

      {/* Category */}
      <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <i className="fa-solid fa-briefcase text-indigo-500"></i>
        {job.category} • {job.subcategory}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {job.skills?.map((skill, i) => (
          <span
            key={i}
            className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full 
                       bg-blue-50 text-indigo-700 
                       dark:bg-blue-900/40 dark:text-indigo-300 
                       shadow-sm"
          >
            {skill.name}
          </span>
        ))}
      </div>

      {/* Location */}
      {job.locationPreference && (
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <i className="fa-solid fa-location-dot text-red-500"></i>
          {job.locationPreference.type === "worldwide"
            ? "Worldwide"
            : `${job.locationPreference.city || ""}, ${job.locationPreference.country || ""}`}
        </p>
      )}

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base break-all">
        {job.description}
      </p>

      {/* Budget */}
      {job.payment && (
        <p className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          <i className="fa-solid fa-wallet"></i>
          Budget: {job.payment.budget ?? "N/A"} ({job.payment.type})
        </p>
      )}

      {/* Meta Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <p>
          <i className="fa-regular fa-calendar"></i> Created:{" "}
          {new Date(job.createdAt).toLocaleDateString()}
        </p>
        <p>
          <i className="fa-solid fa-clock"></i> Duration: {job.duration ?? "N/A"}
        </p>
        <p>
          <i className="fa-solid fa-hourglass-half"></i> Hours/Day:{" "}
          {job.hoursPerDay ?? "N/A"}
        </p>
        <p>
          <i className="fa-solid fa-users"></i> Proposals: {job.proposalCount}
        </p>
        <p>
          <i className="fa-solid fa-star"></i> Featured: {job.isFeatured ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
};

export default JobDetails;