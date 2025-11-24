import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

interface ProfileImageProps {
  src?: string;
  size?: number;
  className?: string;
  useAuthFallback?: boolean;
}


const ProfileImage: React.FC<ProfileImageProps> = ({ src, size = 160, useAuthFallback = false, className = '' }) => {
  const fallbackImage = useSelector((state: RootState) => state.auth.user?.profileImage);
  const profileImage = src || (useAuthFallback ? fallbackImage : undefined);

  const imageSize = `${size}px`;

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 flex items-center justify-center"
        style={{ width: imageSize, height: imageSize }}
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-1/2 w-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default ProfileImage;