import React from 'react';

interface ProfileSectionProps {
  title: string;
  content: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, content }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
        {title}
      </h2>
      <div className="w-16 h-1 bg-blue-600 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">{content}</p>
    </div>
  );
};

export default ProfileSection;