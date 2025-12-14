import React from "react";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => (
  <div className="p-3 rounded border border-gray-200 dark:border-gray-700 mb-4">
    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{title}</h3>
    {children}
  </div>
);

export default InfoCard;