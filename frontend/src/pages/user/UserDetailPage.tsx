import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/ui/Loader/Loader";
import { userService } from "../../services/user.service";

interface UserDetailDto {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "client" | "freelancer" | "admin";
  professionalTitle?: string;
  about?: string;
  skills?: { _id: string; name: string }[];
  ratings?: { asFreelancer: number };
  profileImage?: string;
  status?: string;
}

const UserDetailPage: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserDetailDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await userService.getProfileById(userId);
        console.log("🚀 ~ fetchUser ~ response:", response)
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
    <section className="bg-white dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto rounded-lg shadow-md bg-gray-50 dark:bg-gray-800 p-6">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={user.profileImage || "/default-avatar.png"}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.name || user.username}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user.professionalTitle || user.role}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* About */}
        {user.about && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              About
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{user.about}</p>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill._id}
                  className="px-3 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ratings */}
        {user.ratings !== undefined && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ratings
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{user.ratings.asFreelancer} / 5</p>
          </div>
        )}

        {/* Status */}
        {user.status && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Status
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{user.status}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserDetailPage;