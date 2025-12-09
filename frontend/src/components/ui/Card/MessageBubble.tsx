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
      className={`flex items-start gap-3 p-3 rounded-md ${
        isClient
          ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          : "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" 
      }`}
    >
      {/* Avatar */}
      <ProfileImage size={40} src={profileImage}/>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium">
            {senderName} ({senderRole})
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp}
          </span>
        </div>
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
};

export default MessageBubble;