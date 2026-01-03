import React from "react";
import ProfileImage from "./profile/ProfileImage";
import VerifiedBadge from "../ui/VerifiedBadge";

interface UserInfoProps {
  username: string;
  email: string;
  profileImage?: string | null;
  size?: number;
  useAuthFallback?: boolean;
  isVerified?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({
  username,
  email,
  profileImage,
  size = 40,
  useAuthFallback = false,
  isVerified,
}) => {
  return (
    <div className="flex items-center gap-3">
      <ProfileImage src={profileImage || undefined} size={size} useAuthFallback={useAuthFallback} />
      {/* User Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
            {username}
          </span>
          <span>{isVerified && <VerifiedBadge size={18} />}</span> 
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{email}</div>
      </div>

    </div>
  );
};

export default UserInfo;