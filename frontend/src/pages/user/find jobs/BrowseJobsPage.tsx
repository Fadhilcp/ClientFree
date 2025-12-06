import React, { useEffect, useState } from "react";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import type { JobListDTO } from "../../../types/job/job.dto";
import Loader from "../../../components/ui/Loader/Loader";
import { useLocation, useNavigate } from "react-router-dom";
import { jobService } from "../../../services/job.service";
import { notify } from "../../../utils/toastService";

const BrowseJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isInterestedPage = location.pathname.includes("/find-jobs/interested");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = isInterestedPage
        ? await jobService.getInterestedJobs()
        : await jobService.getJobs("open");

      if (response.data.success) {
        const { jobs } = response.data;
        setJobs(jobs);
      }
    } catch (error: any) {
      console.error("Failed to load jobs:", error);
      notify.error(error.response?.data?.error || "Failed to load jobs, Try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [isInterestedPage]);

  const handleSearch = (query: string) => {
    console.log("Searching jobs for:", query);
  };

  const handleViewDetails = (jobId: string) => {
    navigate(`/job-details/${jobId}`);
  };

  const handleToggleInterest = async (jobId: string, interested: boolean) => {
    try {
      if (interested) {
        await jobService.removeInterestedJob(jobId);
      } else {
        await jobService.addInterestedJob(jobId); 
      }

      fetchJobs();
    } catch (error: any) {
      console.error("Failed to update interested:", error);
      notify.error(error.response?.data?.error || "Failed to update interested");
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      {loading && <Loader />}
      <div className="container mx-auto">
        {/* Title + Search aligned */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
            {isInterestedPage ? "Interested Jobs" : "Find Jobs"}
          </h2>
          <SearchBar
            placeholder={isInterestedPage ? "Search interested jobs..." : "Search jobs..."}
            onSearch={handleSearch}
          />
        </div>

        {/* Empty State */}
        {(!jobs || jobs.length === 0) && (
          <p className="text-gray-500 text-center py-10">
            {isInterestedPage ? "No interested jobs found." : "No jobs found."}
          </p>
        )}

        {/* Job Cards */}
        {jobs &&
          jobs.length > 0 &&
          jobs.map((job) => (
            <Card
              key={job.id}
              title={job.title}
              subtitle={`${job.category} • ${job.subcategory}`}
              meta={[
                { label: "Proposals", value: String(job.proposalCount ?? 0) },
                { label: "Created", value: new Date(job.createdAt).toLocaleDateString() },
                { label: "Duration", value: job.duration || "N/A" },
              ]}
              tags={job.skills ? job.skills.map((s) => s.name) : []}
              description={job.description}
              status={job.status}
              actions={[
                {
                  label: job.isInterested ? <i className="fa-solid fa-thumbs-up text-indigo-600"></i> : <i className="fa-regular fa-thumbs-up"></i>,
                  onClick: () => handleToggleInterest(job.id, job.isInterested!),
                  variant: job.isInterested ? "danger" : "secondary",
                },
                {
                  label: "View Details",
                  onClick: () => handleViewDetails(job.id),
                  variant: "primary",
                },
              ].filter(Boolean) as ActionItem[]}
            />
          ))}
      </div>
    </section>
  );
};

export default BrowseJobsPage;