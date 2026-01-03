import React from "react";

type VerifiedBadgeProps = {
  size?: number;
  className?: string;
  showLabel?: boolean;
};

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 20,
  className = "",
  showLabel = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title="Verified"
    >
      {/* Badge Circle */}
      <span
        style={{ width: size, height: size }}
      >
        <span
          className="material-symbols-outlined dark:text-yellow-500 text-yellow-500"
          style={{ fontSize: size * 0.7 }}
        >
          verified
        </span>
      </span>

      {/* Label */}
      {showLabel && (
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          Verified
        </span>
      )}
    </span>
  );

};

export default VerifiedBadge;