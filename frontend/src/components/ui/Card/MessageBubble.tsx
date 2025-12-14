import React from "react";
import ProfileImage from "../../user/profile/ProfileImage";

interface MessageBubbleProps {
  senderName: string;
  senderRole: "client" | "freelancer";
  profileImage?: string;
  content: string;
  timestamp: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  senderName,
  senderRole,
  profileImage,
  content,
  timestamp,
}) => {
  const isClient = senderRole === "client";

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-sm transition-all duration-200 ${
        isClient
          ? "bg-indigo-50 dark:bg-indigo-900/30 text-gray-800 dark:text-gray-200"
          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      }`}
    >
      {/* Avatar */}
      <ProfileImage size={40} src={profileImage} />

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm flex items-center gap-2">
            {senderName}
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                senderRole === "client"
                  ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
              }`}
            >
              {senderRole}
            </span>
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

export default MessageBubble;