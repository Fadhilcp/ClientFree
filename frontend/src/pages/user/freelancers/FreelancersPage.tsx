import React, { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { userService } from "../../../services/user.service";
import type { FreelancerListItemDto } from "../../../types/user/freelancerProfile.dto";

const FreelancersPage: React.FC = () => {
  const [freelancers, setFreelancers] = useState<FreelancerListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);

  // Load freelancers
  const fetchFreelancers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await userService.getFreelancers("", 10, 20);
      if (response?.data.success) {
        const { freelancers } = response.data;
        setFreelancers(freelancers);
      }
    } catch (err) {
      console.error("Failed to load freelancers:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  const handleSearch = (query: string) => {
    console.log("Searching freelancers for:", query);
    // TODO: implement search API call
  };

  const handleViewDetails = (freelancerId: string) => {
    navigate(`/users/${freelancerId}`);
  }; 

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      {loading && <Loader />}
      <div className="container mx-auto">
        {/* Title + Search aligned */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
            Freelancers
          </h2>
          <SearchBar placeholder="Search freelancers..." onSearch={handleSearch} />
        </div>

        {/* Empty State */}
        {(!freelancers || freelancers.length === 0) && (
          <p className="text-gray-500 text-center py-10">
            No Freelancers found.
          </p>
        )}

        {/* Freelancer Cards */}
        {freelancers &&
          freelancers.length > 0 &&
          freelancers.map((freelancer) => (
            <Card
              key={freelancer.id}
              title={freelancer.name || freelancer.username}
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
                  label: "View Profile",
                  onClick: () => handleViewDetails(freelancer.id),
                  variant: "primary",
                },
              ]}
            />
          ))}
      </div>
    </section>
  );
};

export default FreelancersPage;