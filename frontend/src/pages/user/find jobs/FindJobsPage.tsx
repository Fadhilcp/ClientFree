import React, { useEffect, useState } from "react";
import Card from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import type { JobListDTO } from "../../../types/job/job.dto";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { jobService } from "../../../services/job.service";



const FindJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobService.getJobs('open');
      if(response.data.success){
        const { jobs } = response.data;
          setJobs(jobs);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (query: string) => {
    console.log("Searching jobs for:", query);
  };

  const handleViewDetails = (jobId: string) => {
    navigate(`/job-details/${jobId}`);
  };

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      {loading && <Loader />}
      <div className="container mx-auto">
        {/* Title + Search aligned */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
            Find Jobs
          </h2>
          <SearchBar placeholder="Search jobs..." onSearch={handleSearch} />
        </div>

        {/* Empty State */}
        {(!jobs || jobs.length === 0) && (
          <p className="text-gray-500 text-center py-10">
            No jobs found.
          </p>
        )}

        {/* Job Cards */}
        {jobs && jobs.length > 0 && jobs.map((job) => (
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
                label: "View Details",
                onClick: () => handleViewDetails(job.id),
                variant: "primary",
              },
              {
                label: "Place Bid",
                onClick: () => {},
                variant: "secondary",
              },
            ]}
          />
        ))}
      </div>
    </section>
  );
};

export default FindJobsPage;