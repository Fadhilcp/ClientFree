import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import { jobService } from "../../../services/job.service";
import type { JobListDTO } from "../../../types/job/job.dto";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import Loader from "../../../components/ui/Loader/Loader";
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { notify } from "../../../utils/toastService";
import ConfirmationModal from "../../../components/ui/Modal/ConfirmationModal";

const LIMIT = 20;

const JobsPage: React.FC<{ status: string; title: string }> = ({
  status,
  title,
}) => {
  const [jobs, setJobs] = useState<JobListDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // infinite scroll
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const updatedAt = useSelector((state: RootState) => state.job.updatedAt);

  const { startEditJob } = useOutletContext<{
    startEditJob: (job: JobListDTO) => void;
  }>();

  const [searchParams] = useSearchParams();

  const filters = {
    category: searchParams.get("category") || undefined,
    location: searchParams.get("location") || undefined,
    budgetMin: searchParams.get("budgetMin")
      ? Number(searchParams.get("budgetMin"))
      : undefined,
    budgetMax: searchParams.get("budgetMax")
      ? Number(searchParams.get("budgetMax"))
      : undefined,
  };

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && !Number.isNaN(value)) {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }, [filters]);

  const fetchJobs = useCallback(
    async (loadMore = false) => {
      if (!user) return;
      if (loading) return;
      if (!hasMore && loadMore) return;

      setLoading(true);

      try {
        const safeCursor = cursor ?? "";
        let response;

        if (user.role === "client") {
          response = await jobService.getMyJobs(
            status,
            searchQuery,
            loadMore ? safeCursor : "",
            LIMIT,
            filterQuery
          );
        } else {
          response = await jobService.getFreelancerJob(
            status,
            searchQuery,
            loadMore ? safeCursor : "",
            LIMIT,
            filterQuery
          );
        }

        if (response?.data.success) {
          const { jobs, nextCursor } = response.data;

          setJobs((prev) => (loadMore ? [...prev, ...jobs] : jobs));
          setCursor(nextCursor);
          setHasMore(Boolean(nextCursor));
        }
      } catch (error: any) {
        console.error("Failed to load jobs:", error);
        notify.error(
          error.response?.data?.error || "Failed to load jobs"
        );
      } finally {
        setLoading(false);
      }
    },
    [user, status, searchQuery, cursor, hasMore, loading, filterQuery]
  );
  // reset on status / filters / update
  useEffect(() => {
    setJobs([]);
    setCursor(null);
    setHasMore(true);
    fetchJobs(false);
  }, [status, updatedAt, filterQuery]);

  // search debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setJobs([]);
      setCursor(null);
      setHasMore(true);
      fetchJobs(false);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const bottomReached =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200;

      if (bottomReached && !loading && hasMore) {
        fetchJobs(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, fetchJobs]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleViewDetails = (jobId: string) => {
    navigate(`/job-details/${jobId}`);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const res = await jobService.deleteJob(jobToDelete);
      if (res.data.success) {
        notify.success("Job deleted successfully");
        setJobs([]);
        setCursor(null);
        setHasMore(true);
        fetchJobs(false);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to delete job");
    } finally {
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      {loading && <Loader />}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Job"
        description="Are you sure you want to delete this job?"
        onConfirm={confirmDeleteJob}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
            {title}
          </h2>
          <SearchBar placeholder="Search jobs..." onSearch={handleSearch} />
        </div>

        {jobs.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-10">
            No {title} jobs found.
          </p>
        )}

        {jobs.map((job) => (
          <Card
            key={job.id}
            title={job.title}
            subtitle={`${job.category} • ${job.subcategory}`}
            meta={[
              { label: "Proposals", value: String(job.proposalCount ?? 0) },
              {
                label: "Created",
                value: new Date(job.createdAt).toLocaleDateString(),
              },
              { label: "Duration", value: job.duration || "N/A" },
            ]}
            tags={job.skills?.map((s) => s.name) || []}
            description={job.description}
            status={job.status}
            actions={[
              {
                label: "View Details",
                onClick: () => handleViewDetails(job.id),
                variant: "primary",
              },
              user?.role === "client" && job.status === "open"
                ? {
                    label: "Edit",
                    onClick: () => startEditJob(job),
                    variant: "secondary",
                  }
                : null,
              user?.role === "client" && job.status === "open"
                ? {
                    label: "Delete",
                    onClick: () => {
                      setJobToDelete(job.id);
                      setIsDeleteModalOpen(true);
                    },
                    variant: "secondary",
                  }
                : null,
            ].filter(Boolean) as ActionItem[]}
          />
        ))}

        {!hasMore && jobs.length > 0 && (
          <p className="text-center text-gray-400 py-4">
            No more jobs.
          </p>
        )}
      </div>
    </section>
  );
};

export default JobsPage;
