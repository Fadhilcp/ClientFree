import React from "react";
import Button from "../Button";
import UserInfo from "../../user/UserInfo";

interface MetaItem {
  label: string;
  value: string;
}

export interface ActionItem {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary";
}

interface CardUser {
  id: string;
  username: string;
  email: string;
  profileImage?: string | null;
}

interface CardProps {
  user?: CardUser;
  image?: string;
  title: string;
  subtitle?: string;
  meta?: MetaItem[];
  tags?: string[];
  description?: string;
  status?: string;
  footer?: string;
  actions?: ActionItem[];
}

const Card: React.FC<CardProps> = ({
  user,
  image,
  title,
  subtitle,
  meta = [],
  tags = [],
  description,
  status,
  footer,
  actions = [],
}) => {
return (
  <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 
                  rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
    {/* User section */}
    {user && (
      <div className="mb-5">
        <UserInfo
          username={user.username}
          email={user.email}
          profileImage={user.profileImage}
          size={48}
        />
      </div>
    )}

    <div className="flex flex-col lg:flex-row items-start gap-8">
      {/* Image / Logo */}
      {image && (
        <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-md ring-1 ring-gray-200 dark:ring-gray-700">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      {/* Details */}
      <div className="flex-1">
        <h5 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2 tracking-tight">
          {title}
        </h5>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {subtitle}
          </p>
        )}

        {/* Meta info */}
        {meta.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
            {meta.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="font-semibold">{item.label}:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {item.value}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs font-semibold rounded-full 
                           bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 
                           dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-300 
                           shadow-sm hover:shadow-md transition-all duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        {/* Status */}
        {status && (
          <span className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full 
                           bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 
                           shadow-sm ring-1 ring-green-200 dark:ring-green-700">
            {status}
          </span>
        )}

        {/* Footer */}
        {footer && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
            {footer}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex-shrink-0 lg:pl-8 mt-6 lg:mt-0 flex flex-col gap-3">
          {actions.map((action, i) => (
            <Button
              key={i}
              label={action.label}
              onClick={action.onClick}
              variant={action.variant}
              className="text-sm font-semibold px-5 py-2 rounded-lg shadow-md 
                         transition-all duration-200"
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
};

export default Card;