// import SidebarHeader from "./SidebarHeader";
import ChatSearch from "./ChatSearch";
import type { ChatListDTO } from "../../../types/chat/chat.dto";
import ChatListItem from "./ChatListItem";

interface ChatSidebarProps {
  chats: ChatListDTO[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  search: string;
  onSearch: (value: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  search,
  onSearch,
}) => {
  return (
    <div className="w-1/4 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg rounded-l-xl overflow-hidden">
      {/* Header */}
      {/* <SidebarHeader /> */}

      {/* Search */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <ChatSearch value={search} onChange={onSearch} />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
          <div className="bg-gray-50 dark:bg-gray-800 flex-1 overflow-auto">
          {chats.map((chat, i) => (
            <ChatListItem 
              key={i} 
              chat={chat} 
              isSelected={chat.id === selectedChatId}
              onClick={() => onSelectChat(chat.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;