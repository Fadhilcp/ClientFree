import React, { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import { jobService } from "../../../services/job.service";
import type { JobListDTO } from "../../../types/job/job.dto";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate } from "react-router-dom";



const JobsPage: React.FC<{ status: string; title: string }> = ({ status, title }) => {
    const [jobs, setJobs] = useState<JobListDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const updateAt = useSelector((state: RootState) => state.job.updatedAt);
    const { user } = useSelector((state: RootState) => state.auth);

    // Load active jobs
    const fetchJobs = useCallback(async () => {
      if(!user) return;
      setLoading(true);
        try {
            let response;
            if(user.role === 'client'){
              response = await jobService.getMyJobs(status);
            }else if(user.role === 'freelancer'){
              response = await jobService.getFreelancerJob(status);
            }

            if (response?.data.success) {
                setJobs(response.data.jobs);
            }
        } catch (err) {
            console.error("Failed to load active jobs:", err);
        }finally {
          setLoading(false);
        }
    }, [status, user]);

    useEffect(() => {
        fetchJobs();
    }, [updateAt, fetchJobs]);

    const handleSearch = (query: string) => {
        console.log("Searching jobs for:", query);
    };

    const handleViewDetails = (jobId: string) => {
      navigate(`/job-details/${jobId}`);
    };

  return (

    <section className="bg-white dark:bg-gray-900 min-h-screen">
      { loading && <Loader/> }
      <div className="container mx-auto">
        {/* Title + Search aligned */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
            {title}
          </h2>
          <SearchBar placeholder="Search jobs..." onSearch={handleSearch} />
        </div>

        {/* Empty State */}
        {(!jobs || jobs.length === 0) && (
        <p className="text-gray-500 text-center py-10">
            No {title} jobs found.
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
          tags={job.skills ? job.skills.map(s => s.name) : []}
          description={job.description}
          status={job.status}
          actions={[
              {
                label: "View Details",
                onClick: () => handleViewDetails(job.id),
                variant: "primary",
              },
            ]}
          />
          ))}
      </div>
    </section>
  );
};

export default JobsPage;