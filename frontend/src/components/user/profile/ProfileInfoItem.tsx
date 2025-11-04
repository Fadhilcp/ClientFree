import React from 'react';

interface ProfileInfoItemProps {
  label: string;
  value: string;
}

const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({ label, value }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</h3>
      <p className="text-gray-600 dark:text-gray-400">{value}</p>
    </div>
  );
};

export default ProfileInfoItem;