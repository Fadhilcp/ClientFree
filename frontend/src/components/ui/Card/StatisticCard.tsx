import React from "react";

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  centered?: boolean;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, icon, color = "indigo", centered }) => {
  return (
    <div
      className={`max-w-xs w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border 
        border-indigo-600 dark:border-indigo-500
                  ${centered ? "text-center" : "flex items-center space-x-4"}`}
    >
      {icon && !centered && (
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </p>
        <p className={`${centered ? "text-4xl" : "text-2xl"} font-bold text-gray-900 dark:text-gray-100 mt-2`}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatisticCard;