import React from 'react';
import type { SkillItem } from '../../../types/skill.types';

interface TagListSectionProps {
  title: string;
  items: SkillItem[];
}

const TagListSection: React.FC<TagListSectionProps> = ({ title, items }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
        {title}
      </h2>
      <div className="w-16 h-1 bg-blue-600 mb-4"></div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagListSection;