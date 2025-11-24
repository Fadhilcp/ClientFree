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
    <div className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {/* User section */}
      {user && (
        <div className="mb-4">
          <UserInfo
            username={user.username}
            email={user.email}
            profileImage={user.profileImage}
            size={40}
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Image / Logo */}
        {image && (
          <div className="flex-shrink-0 w-20 h-20">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}

        {/* Details */}
        <div className="flex-1">
          <h5 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
            {title}
          </h5>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {subtitle}
            </p>
          )}

          {/* Meta info */}
          {meta.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300 mb-2">
              {meta.map((item, i) => (
                <span key={i}>
                  <span className="font-medium">{item.label}:</span>{" "}
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {item.value}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {description}
            </p>
          )}

          {/* Status */}
          {status && (
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">
              Status: {status}
            </p>
          )}

          {/* Footer */}
          {footer && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {footer}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex-shrink-0 lg:pl-6 mt-3 lg:mt-0 flex flex-col gap-2">
            {actions.map((action, i) => (
              <Button
                key={i}
                label={action.label}
                onClick={action.onClick}
                variant={action.variant}
                className="text-sm font-medium px-3 py-1 rounded-sm"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;