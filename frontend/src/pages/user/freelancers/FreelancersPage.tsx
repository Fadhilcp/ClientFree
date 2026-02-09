import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { userService } from "../../../services/user.service";
import type { FreelancerListItemDto } from "../../../types/user/freelancerProfile.dto";
import { jobService } from "../../../services/job.service";
import { proposalService } from "../../../services/proposal.service";
import { notify } from "../../../utils/toastService";
import UserModal from "../../../components/ui/Modal/UserModal";
import Button from "../../../components/ui/Button";
import { matchService } from "../../../services/match.service";
import BestMatchModal from "../../../components/ui/Modal/BestMatchModal";
import { chatService } from "../../../services/chat.service";

const LIMIT = 20;

const FreelancersPage: React.FC = () => {
  const [freelancers, setFreelancers] = useState<FreelancerListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // for infinit scroll
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const isInterestedPage = location.pathname.includes("/freelancers/interested");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerListItemDto | null>(null);

  const [formData, setFormData] = useState({
    message: "",
    jobId: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [clientJobs, setClientJobs] = useState<{ id: string; title: string }[]>([]);

  const { user, subscription } = useSelector((state: RootState) => state.auth);

  const bestMatch = Boolean(subscription?.features.BestMatch);
  const hasDirectMessaging = Boolean(subscription?.features?.DirectMessaging);

  const [isBestMatchOpen, setIsBestMatchOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [isBestMatchMode, setIsBestMatchMode] = useState(false);

  const [searchParams] = useSearchParams();
  
  const filters = {
    location: searchParams.get("location") || undefined,
    experience: searchParams.get("experience") || undefined,

    hourlyRateMin: searchParams.get("hourlyRateMin")
      ? Number(searchParams.get("hourlyRateMin"))
      : undefined,
    hourlyRateMax: searchParams.get("hourlyRateMax")
      ? Number(searchParams.get("hourlyRateMax"))
      : undefined,
    ratingMin: searchParams.get("ratingMin")
      ? Number(searchParams.get("ratingMin"))
      : undefined,

    skills: searchParams.getAll("skills"),
  };
// to convert object filter fields into query params
  const filterQuery = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === "") return;

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v) params.append(key, v);
        });
        return;
      }

      if (typeof value === "number" && Number.isNaN(value)) return;

      params.append(key, String(value));
    });

    return params.toString(); 
  }, [filters]);
  // Load freelancers
  const fetchFreelancers = useCallback(
    async (loadMore = false) => {
    if (!user) return;
    if(loading) return;

    if(!hasMore && loadMore) return;

    setLoading(true);
    try {
      const safeCursor =  cursor ?? "";
      let response; 
      if(isInterestedPage){
        response = await userService.getInterestedFreelancers(
          loadMore ? safeCursor : "", LIMIT, searchQuery, filterQuery
        );
      }else{
        response = await userService.getFreelancers(
          loadMore ? safeCursor : "" , LIMIT, searchQuery, filterQuery
        );
      }

      if (response?.data.success) {
        const { freelancers, nextCursor } = response.data;

        setFreelancers(prev => (loadMore ? [...prev, ...freelancers] : freelancers));
        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
      }
    } catch (err) {
      console.error("Failed to load freelancers:", err);
    } finally {
      setLoading(false);
    }
  }, [user, isInterestedPage, hasMore, loading, searchQuery, filterQuery]);

  const fetchClientJobs = useCallback(async () => {
    if (!user || user.role !== "client") return;
    try {
      const response = await jobService.getMyJobs("open", "", "", 0, "");
      if (response.data.success) {
        const { jobs } = response.data;
        setClientJobs(jobs);
      }
    } catch (error) {
      console.error("Failed to load client jobs:", error);
    }
  }, [user]);

  const fetchBestMatchFreelancers = async (loadMore = false) => {
    if(!bestMatch) return;
    if (!selectedJobId) {
      notify.error("Please select a job");
      return;
    }

    if (loading) return;
    if (!hasMore && loadMore) return;

    setLoading(true);
    try {
      const safeCursor = cursor ?? "";

      const res = await matchService.getBestMatchFreelancers(
        selectedJobId,
        loadMore ? safeCursor : "",
        LIMIT,
        searchQuery,
        filterQuery
      );

      if (res.data.success) {
        const { freelancers, nextCursor } = res.data;

        setFreelancers(prev =>
          loadMore ? [...prev, ...freelancers] : freelancers
        );
        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
        setIsBestMatchMode(true);
        setIsBestMatchOpen(false);
      }
    } catch (e: any) {
      notify.error(
        e.response?.data?.error || "Failed to fetch best matches"
      );
    } finally {
      setLoading(false);
    }
  }
  // infinit scroll even listener
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;

      if (bottom) {
        if (isBestMatchMode) {
          fetchBestMatchFreelancers(true);
        } else {
          fetchFreelancers(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, fetchFreelancers, isBestMatchMode]);

  useEffect(() => {
    setFreelancers([]);
    setCursor(null);
    setHasMore(true);
    fetchFreelancers(false);
    fetchClientJobs();
  }, [isInterestedPage]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCursor(null);
    setHasMore(true);
  }, []);

  useEffect(() => {

    const delay = setTimeout(() => {
      if (isBestMatchMode) {
        fetchBestMatchFreelancers(false);
      } else {
        fetchFreelancers(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery, filterQuery, isBestMatchMode]);

  const handleViewDetails = (freelancerId: string) => {
    navigate(`/users/${freelancerId}`);
  };

  const handleInviteClick = (freelancer: FreelancerListItemDto) => {
    setSelectedFreelancer(freelancer);
    setIsInviteOpen(true);
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    setIsInviteOpen(false);
    setFormData({ message: "", jobId: "" });
    setSelectedFreelancer(null);
  };

  const handleSendInvite = async (data: typeof formData) => {
    if (!selectedFreelancer) return;

    const newErrors: Partial<typeof formData> = {};
    if (!data.message) newErrors.message = "Message is required";
    if (!data.jobId) newErrors.jobId = "Please select a job";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await proposalService.inviteFreelancer(
        data.jobId,
        selectedFreelancer.id,
        { message: data.message }
      );
      if (response.data.success) {
        notify.success(`Invitation sent to Freelancer ${selectedFreelancer.name}`);
      }
      handleCloseModal();
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to send invitation");
    }
  };
// to mark and unmark interest
  const handleToggleInterest = async (freelancerId: string, interested: boolean) => {
    try {
      if (interested) {
        await userService.removeInterestedFreelancer(freelancerId);
      } else {
        await userService.addInterestedFreelancer(freelancerId);
      }
      
    fetchFreelancers();
    } catch (err) {
      console.error("Failed to toggle freelancer interest:", err);
    }
  };

    const handleChat = async (receiverId: string) => {
        try {
            const res = await chatService.getOrCreateChat(receiverId);
            if (res.data.success) {
                navigate(`/chats`);
            }
        } catch (err) {
            notify.error("Failed to open chat");
        }
    };

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      {loading && <Loader />}
      <div className="container mx-auto">
        {/* Title + Search aligned */}
     
          {/* Title + Search aligned */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            {/* Title */}
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
              {isInterestedPage ? "Interested Freelancers" : "Freelancers"}
            </h2>

            {/* Best Match Button (conditionally rendered) */}
            {bestMatch && (
              <Button
                label={isBestMatchMode ? "All Freelancer" : "Best Match"}
                onClick={() => {
                  if (isBestMatchMode) {
                    setIsBestMatchMode(false);
                    setSelectedJobId("");
                    setCursor(null);
                    setHasMore(true);
                    fetchFreelancers(false);
                  } else {
                    setIsBestMatchOpen(true);
                  }
                }}
              />
            )}

            {/* Search Bar */}
            <SearchBar
              placeholder={
                isInterestedPage
                  ? "Search interested freelancers..."
                  : "Search freelancers..."
              }
              onSearch={handleSearch}
            />
        </div>
        <BestMatchModal
          open={isBestMatchOpen}
          jobs={clientJobs}
          selectedJobId={selectedJobId}
          onChangeJob={setSelectedJobId}
          onCancel={() => setIsBestMatchOpen(false)}
          onSubmit={fetchBestMatchFreelancers}
          loading={loading}
        />


        {/* Empty State */}
        {(!freelancers || freelancers.length === 0) && (
          <p className="text-gray-500 text-center py-10">
            {isInterestedPage ? "No interested freelancers found." : "No freelancers found."}
          </p>
        )}

        {/* Freelancer Cards */}
        {freelancers &&
          freelancers.length > 0 &&
          freelancers.map((freelancer) => (
            <Card
              key={freelancer.id}
              title={freelancer.name || freelancer.username}
              isVerified={freelancer.isVerified}
              subtitle={freelancer.professionalTitle}
              meta={[
                { label: "Experience", value: freelancer.experienceLevel },
                { label: "Ratings", value: String(freelancer.ratings ?? 0) },
                { label: "Status", value: freelancer.status },
              ]}
              tags={freelancer.skills ? freelancer.skills.map((s) => s.name) : []}
              description={freelancer.about}
              image={freelancer.profileImage}
              actions={[
                {
                  label: freelancer.isInterested ? <i className="fa-solid fa-thumbs-up text-indigo-600"></i> : <i className="fa-regular fa-thumbs-up"></i>,
                  onClick: () => handleToggleInterest(freelancer.id, freelancer.isInterested!),
                  variant: "secondary",
                },
                {
                  label: "View Profile",
                  onClick: () => handleViewDetails(freelancer.id),
                  variant: "primary",
                },
                user?.role === "client"
                  ? {
                      label: "Invite",
                      onClick: () => handleInviteClick(freelancer),
                      variant: "secondary",
                    }
                  : null,
                hasDirectMessaging ? {
                  label: "Chat",
                  onClick: () => handleChat(freelancer.id),
                  variant: "primary" as const,
                } : null,
              ].filter(Boolean) as ActionItem[]}
            />
          ))} 

          {/* Invite Modal */}
          <UserModal
            isOpen={isInviteOpen}
            onClose={() => handleCloseModal()}
            onSubmit={handleSendInvite}
            formData={formData}
            onChange={handleFormChange}
            title={`Invite ${selectedFreelancer?.name || selectedFreelancer?.username}`}
            errors={errors}
            textAreas={[
              { name: "message", label: "Message", placeholder: "Write your message...", rows: 4 },
            ]}
          >
            {/* Custom dropdown injected as children */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Job
              </label>
              <select
                value={formData.jobId}
                onChange={(e) => handleFormChange("jobId", e.target.value)}
                className="w-full px-3 py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-sm text-gray-900
              dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-gray-400
                dark:focus:border-gray-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select a job</option>
                {clientJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              {errors?.jobId && (
                <p className="mt-1 text-sm text-red-500">{errors.jobId}</p>
              )}
            </div>
          </UserModal>
          
      </div>
    </section>
  );
};

export default FreelancersPage;