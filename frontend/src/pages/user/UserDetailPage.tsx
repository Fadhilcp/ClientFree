import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/ui/Loader/Loader";
import { userService } from "../../services/user.service";
import ProfileImage from "../../components/user/profile/ProfileImage";
import Button from "../../components/ui/Button";

interface SkillItem {
  _id: string;
  name: string;
}

interface UserDetailDto {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "client" | "freelancer" | "admin";
  professionalTitle?: string;
  about?: string;
  description?: string;
  skills?: SkillItem[];
  ratings?: { asFreelancer: number };
  profileImage?: string;
  status?: string;
  hourlyRate?: string;
  experienceLevel?: string;
  location?: { city: string; state: string; country: string };
  phone?: string;
  portfolio?: { portfolioFile: string; resume: string };
  stats?: { jobsCompleted: number; reviewsCount: number; earningTotal: number };
  externalLinks?: { label: string; url: string }[];
  createdAt?: string;
}

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
      } catch (err) {
        console.error("Failed to load user:", err);
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
    {/* Back Button */}
    <div className="max-w-6xl mx-auto mb-6 flex">
      <Button
        onClick={() => navigate(-1)}
        variant="secondary"
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 
                   dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 shadow-sm transition-all duration-200"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i> Back
      </Button>
    </div>

    {/* Profile Card */}
    <div className="max-w-6xl mx-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 p-8 border border-gray-100 dark:border-gray-700">
      {/* Profile Header */}
      <div className="flex items-center gap-8 mb-8">
        <ProfileImage src={user.profileImage} useAuthFallback size={120} className="rounded-full shadow-md ring-2 ring-indigo-500" />
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {user.name || user.username}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.professionalTitle || user.role}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          {user.phone && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <i className="fa-solid fa-phone text-indigo-500"></i> {user.phone}
            </p>
          )}
        </div>
      </div>

      {/* About / Description */}
      {user.about && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">About</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.about}</p>
        </div>
      )}
      {user.description && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Description</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.description}</p>
        </div>
      )}

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span
                key={skill._id}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 
                           dark:bg-indigo-900/40 dark:text-indigo-300 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience + Hourly Rate */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {user.experienceLevel && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Experience Level</h2>
            <p className="text-gray-700 dark:text-gray-300">{user.experienceLevel}</p>
          </div>
        )}
        {user.hourlyRate && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Hourly Rate</h2>
            <p className="text-gray-700 dark:text-gray-300">₹ {user.hourlyRate}</p>
          </div>
        )}
      </div>

      {/* Location */}
      {user.location && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Location</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {user.location.city}, {user.location.state}, {user.location.country}
          </p>
        </div>
      )}

      {/* Portfolio */}
      {user.portfolio && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Portfolio</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Resume: {user.portfolio.resume} | Portfolio File: {user.portfolio.portfolioFile}
          </p>
        </div>
      )}

      {/* External Links */}
      {user.externalLinks && user.externalLinks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">External Links</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            {user.externalLinks.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {link.label || link.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats */}
      {user.stats && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Stats</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Jobs Completed: {user.stats.jobsCompleted} | Reviews: {user.stats.reviewsCount} | Earnings: ₹{user.stats.earningTotal}
          </p>
        </div>
      )}

      {/* Ratings */}
      {user.ratings && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Ratings</h2>
          <p className="text-gray-700 dark:text-gray-300">{user.ratings.asFreelancer} / 5</p>
        </div>
      )}

      {/* Status */}
      {user.status && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Status</h2>
          <p className="text-gray-700 dark:text-gray-300">{user.status}</p>
        </div>
      )}

      {/* Created At */}
      {user.createdAt && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Joined</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  </section>
);
};

export default UserDetailPage;