import type { ChatListDTO } from "../../../types/chat/chat.dto";
import ProfileImage from "../profile/ProfileImage";
import { usePresence } from "../../../context/PresenceContext";

interface ChatHeaderProps {
  chat: ChatListDTO;
  isOtherTyping: boolean;
  onStartCall: () => void;
  disabled: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, isOtherTyping, onStartCall, disabled }) => {
  const { otherUser } = chat;
  const { isOnline } = usePresence();

  return (
    <div className="py-3 px-4 flex items-center justify-between border-b">
      <div className="flex items-center">
        <ProfileImage size={40} src={otherUser.profileImage} />
        <div className="ml-4">
          <p className="text-sm font-semibold text-gray-100">{otherUser.name}</p>
          <p className="text-xs text-gray-500">@{otherUser.username}</p>
          {isOtherTyping ? (
            <p className="text-xs text-indigo-500">Typing…</p>
          ) : (
            <p className="text-xs text-indigo-500">
              {isOnline(otherUser.id) ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div> 

      {!disabled && (
        <div className="p-2">
          <button
            onClick={onStartCall}
            className=" hover:text-indigo-400 text-indigo-500"
          >
            <i className="fa-solid fa-video"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
