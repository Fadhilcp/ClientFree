import React from "react";
import ProfileImage from "./profile/ProfileImage";

interface UserInfoProps {
  username: string;
  email: string;
  profileImage?: string | null;
  size?: number;
  useAuthFallback?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({
  username,
  email,
  profileImage,
  size = 40,
  useAuthFallback = false
}) => {
  return (
    <div className="flex items-center gap-3">
      <ProfileImage src={profileImage || undefined} size={size} useAuthFallback={useAuthFallback} />
      <div className="flex flex-col">
        <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
          {username}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{email}</div>
      </div>
    </div>
  );
};

export default UserInfo;