import React, { useCallback, useEffect, useState } from "react";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import { jobService } from "../../../services/job.service";
import type { JobListDTO } from "../../../types/job/job.dto";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate, useOutletContext } from "react-router-dom";
import { notify } from "../../../utils/toastService";
import ConfirmationModal from "../../../components/ui/Modal/ConfirmationModal";

const LIMIT = 20;

const JobsPage: React.FC<{ status: string; title: string }> = ({ status, title }) => {
  const [jobs, setJobs] = useState<JobListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");

  // for infinit scroll
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const updateAt = useSelector((state: RootState) => state.job.updatedAt);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  
  const { startEditJob } = useOutletContext<{ startEditJob: (job: JobListDTO) => void }>();
    // Load active jobs
    const fetchJobs = useCallback(
      async (loadMore = false) => {

      if(!user) return;

      if(loading) return;
      if(!hasMore && loadMore) return;

      setLoading(true);
        try {
          const safeCursor =  cursor ?? "";
          let response;
          if(user.role === 'client'){
            response = await jobService.getMyJobs(
              status, 
              searchQuery, 
              loadMore ? safeCursor : "", 
              LIMIT
            );
          }else if(user.role === 'freelancer'){
            response = await jobService.getFreelancerJob(
              status, 
              searchQuery, 
              loadMore ? safeCursor : "", 
              LIMIT
            );
          }

          if (response?.data.success) {
              const { jobs, nextCursor } = response.data;
              console.log("🚀 ~ JobsPage ~ jobs:", jobs)

              setJobs(prev => (loadMore ? [...prev, ...jobs] : jobs));
              setCursor(nextCursor);
              setHasMore(Boolean(nextCursor));
          }
        } catch (err) {
            console.error("Failed to load active jobs:", err);
        }finally {
          setLoading(false);
        }
    }, [status, user, searchQuery, hasMore, loading]);

    // infinite scroll event listener
    useEffect(() => {
      const handleScroll = () => {
        const bottom = 
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 200;

        if(bottom && !loading && hasMore) {
          fetchJobs(true);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore, fetchJobs]);

    useEffect(() => {
        fetchJobs();
    }, [updateAt, status]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // ========================
  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const response = await jobService.deleteJob(jobToDelete);
      if (response.data.success) {
        notify.success("Job deleted successfully");
        fetchJobs();
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to delete job");
    } finally {
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  const cancelDeleteJob = () => {
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  };
// ===========

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchJobs();
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery]);

    const handleViewDetails = (jobId: string) => {
      navigate(`/job-details/${jobId}`);
    };

  return (

    <section className="bg-white dark:bg-gray-900 min-h-screen">
      { loading && <Loader/> }

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Job"
        description="Are you sure you want to delete this job? This action cannot be undone."
        onConfirm={confirmDeleteJob}
        onCancel={cancelDeleteJob}
      />
      
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
              user?.role === "client" && job.status === "open" ?
                  {
                    label: "Edit",
                    onClick: () => startEditJob(job),
                    variant: "secondary",
                  } : null,
              user?.role === "client" && job.status === "open" ? {
                    label: "Delete",
                    onClick: () => handleDeleteClick(job.id),
                    variant: "secondary"
                  } : null
            ].filter(Boolean) as ActionItem[] }
          />
          ))}
      </div>
    </section>
  );
};

export default JobsPage;