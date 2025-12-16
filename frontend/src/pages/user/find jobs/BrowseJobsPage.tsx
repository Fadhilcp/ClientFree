import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import type { JobListDTO } from "../../../types/job/job.dto";
import Loader from "../../../components/ui/Loader/Loader";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { jobService } from "../../../services/job.service";
import { notify } from "../../../utils/toastService";

const LIMIT = 20;

const BrowseJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  // for infinit scroll
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const isInterestedPage = location.pathname.includes("/find-jobs/interested");

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
    // to convert object filter fields into query params
      const filterQuery = useMemo(() => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && !Number.isNaN(value)) {
            params.append(key, String(value));
          }
        });

        return params.toString(); 
      }, [filters]);

  const fetchJobs = async (loadMore = false) => {
console.log('console from fetchjobs ')
    if(loading) return;
    if(!hasMore && loadMore) return;

    setLoading(true);
    try {
      let response;
      const safeCursor = cursor ?? ""
      if (isInterestedPage) {
          response = await jobService.getInterestedJobs(
            loadMore ? safeCursor : "",
            LIMIT,
            searchQuery,
            filterQuery
          );
        } else {
          response = await jobService.getJobs(
            loadMore ? safeCursor : "",
            LIMIT,
            "open",
            searchQuery,
            filterQuery
          );
        }

      if (response.data.success) {
        const { jobs, nextCursor } = response.data;
        
        if(loadMore){
          setJobs(prev => [...prev, ...jobs]);
        }else{
          setJobs(jobs);
        }

        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
      }
    } catch (error: any) {
      console.error("Failed to load jobs:", error);
      notify.error(error.response?.data?.error || "Failed to load jobs, Try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setJobs([]);
    setCursor(null);
    setHasMore(true);
    fetchJobs(false);
  }, [isInterestedPage]);

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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCursor(null);
    setHasMore(true);
  }, []);

  useEffect(() => {
    fetchJobs(false);
  }, [searchQuery, filterQuery]);

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

          {/* infinite scroll loader */}
        {loading && jobs.length > 0 && (
          <div className="py-4 text-center">
            <Loader />
          </div>
        )}

        {!hasMore && (
          <p className="text-center text-gray-400 py-4">No more jobs.</p>
        )}
      </div>
    </section>
  );
};

export default BrowseJobsPage;