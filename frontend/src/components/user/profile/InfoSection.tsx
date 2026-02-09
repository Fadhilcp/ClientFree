import React from 'react';

interface InfoItem {
  label: string;
  value: string;
  link?: boolean;
}

interface InfoSectionProps {
  title: string;
  items: InfoItem[];
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, items }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
        {title}
      </h2>
      <div className="w-16 h-1 bg-blue-600 mb-4"></div>
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {items.map(({ label, value, link }, index) => (
          <p key={index}>
            <span className="font-medium text-gray-700 dark:text-gray-200">{label}:</span>{' '}
            {link ? (
              <a href={value} className="text-blue-600 hover:underline block truncate max-w-xs"
               title={value} 
              >
                {value}
              </a>
            ) : (
              value
            )}
          </p>
        ))}
      </div>
    </div>
  );
};

export default InfoSection;