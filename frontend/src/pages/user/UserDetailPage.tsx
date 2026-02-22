import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/ui/Loader/Loader";
import { userService } from "../../services/user.service";
import type { FreelancerProfileDto } from "../../types/user/freelancerProfile.dto";
import UserDetailsSection from "../../components/user/UserDetailsSection";
import UserReviewsSection from "../../components/user/reviews/UserReviewsSection";
import type { ClientProfileDto } from "../../types/user/clientProfile.dto";
import { notify } from "../../utils/toastService";

type UserDetailDto = FreelancerProfileDto | ClientProfileDto;

const UserDetailPage: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserDetailDto | null>(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await userService.getProfileById(userId);
        if (response?.data.success) {
          setUser(response.data.user);
        }
      } catch (err: any) {
        notify.error(err.response?.data?.error || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <Loader />;
  if (!user) return <p className="text-center text-gray-500 py-10">User not found.</p>;
  
  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen p-8">

      <UserDetailsSection user={user} onBack={() => navigate(-1)} />
      <UserReviewsSection userId={user.id} role={user.role} />  

      {/* </div> */}
    </section>
  );
};

export default UserDetailPage;