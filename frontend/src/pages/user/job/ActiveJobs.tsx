import React, { useEffect, useState } from "react";
import Card from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import { jobService } from "../../../services/job.service";
import type { JobListDTO } from "../../../types/job/job.dto";



const ActiveJobs: React.FC = () => {
    const [jobs, setJobs] = useState<JobListDTO[]>([]);


    // Load active jobs
    const fetchJobs = async () => {
        try {
            const response = await jobService.getMyJobs();

            if(response.data.success){
                const { jobs } = response.data;
                setJobs(jobs);
            }
        } catch (err) {
            console.error("Failed to load active jobs:", err);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = (query: string) => {
        console.log("Searching jobs for:", query);
    };

    // View details handler (API GET /job/:id)
    const handleViewDetails = async (jobId: string) => {
        try {
            const res = await jobService.getJob(jobId);
            console.log("Job detail:", res);
            // navigate or open modal here if needed
        } catch (err) {
            console.error("Failed to fetch job details:", err);
        }
    };

  return (

    <section className="bg-white dark:bg-gray-900 min-h-screen">

      <div className="container mx-auto">
        {/* Title + Search aligned */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
            Active Jobs
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
            {...job}
            actions={[
            {
                label: "View Details",
                onClick: () => handleViewDetails(job.id),
                variant: "primary" as const,
            },
            ]}
        />
        ))}
      </div>
    </section>
  );
};

export default ActiveJobs;