import React from "react";
import type { FreelancerProfileDto } from "../../../types/user/freelancerProfile.dto";
import type { ClientProfileDto } from "../../../types/user/clientProfile.dto";
import Button from "../Button";
import ProfileImage from "../../user/profile/ProfileImage";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: FreelancerProfileDto | ClientProfileDto | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  function isFreelancer(user: FreelancerProfileDto | ClientProfileDto) : user is FreelancerProfileDto {
    return user.role === 'freelancer';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-900 shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
            <ProfileImage src={user.profileImage} size={70}/>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name || user.username}
          </h2>
          <Button onClick={onClose} className="text-sm bg-transparent hover:bg-transparent text-indigo-600 dark:text-indigo-500 hover:underline"
          label="Close"/>
        </div>

        <div className="space-y-3 text-sm">
          <Detail label="Email" value={user.email} />
          <Detail label="Phone" value={user.phone} />
          <Detail label="Role" value={user.role} />
          <Detail label="Status" value={user.status} />
          <Detail label="Location" value={formatLocation(user.location)} />
          <Detail label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
          <Detail label="Description" value={user.description} />

          {isFreelancer(user) && (
            <>
              <Detail label="Title" value={user.professionalTitle} />
              <Detail label="Hourly Rate" value={user.hourlyRate} />
              <Detail label="Experience Level" value={user.experienceLevel} />
              <Detail label="About" value={user.about} />
              <Detail label="Skills" value={formatSkills(user.skills)} />
              <Detail label="Jobs Completed" value={user.stats.jobsCompleted.toString()} />
              <Detail label="Reviews" value={user.stats.reviewsCount.toString()} />
              <Detail label="Earnings" value={`$${user.stats.earningTotal}`} />
              <Detail label="Rating" value={user.ratings.asFreelancer.toFixed(1)} />
            </>
          )}

          {!isFreelancer(user) && (
            <>
              <Detail label="Company Name" value={user.company?.name} />
              <Detail label="Industry" value={user.company?.industry} />
              <Detail label="Website" value={user.company?.website} />
              <Detail label="Projects Posted" value={user.stats.totalProjectsPosted.toString()} />
              <Detail label="Total Spent" value={`$${user.stats.totalSpent}`} />
              <Detail label="Rating" value={user.ratings.asClient.toFixed(1)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div>
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>{" "}
      <span className="text-gray-800 dark:text-gray-100">{value}</span>
    </div>
  ) : null;

const formatLocation = (loc?: { city?: string; state?: string; country?: string }) =>
  [loc?.city, loc?.state, loc?.country].filter(Boolean).join(", ");

const formatSkills = ( skills?: { _id?: string, name?: string }[]) => 
    skills?.map(skill => skill.name).join(', ');

export default UserDetailModal;