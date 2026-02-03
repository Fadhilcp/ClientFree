import type { ChatListDTO } from "../../../types/chat/chat.dto";
import ProfileImage from "../profile/ProfileImage";

interface ChatListItemProps {
  chat: ChatListDTO;
  isSelected: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  onClick,
}) => {
  const { otherUser, job, lastMessageAt } = chat;

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center px-4 py-3 cursor-pointer transition-colors
        ${isSelected 
          ? "bg-indigo-50 dark:bg-indigo-900/40" 
          : "hover:bg-indigo-50 dark:hover:bg-indigo-900/20"}
      `}
    >

      {/* Avatar */}
      <ProfileImage size={49} src={otherUser.profileImage}/>

      {/* Content */}
      <div className="ml-4 flex-1 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {otherUser.name}
          </p>

          {lastMessageAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(lastMessageAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate">
          {job ? job.title : "Direct chat"}
        </p>
      </div>
    </div>
  );
};

export default ChatListItem;
