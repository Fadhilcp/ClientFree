import ChatSidebar from "../../../components/user/chat/ChatSidebar";
import ChatWindow from "../../../components/user/chat/ChatWindow";
import React, { useEffect, useState } from "react"
import { chatService } from "../../../services/chat.service";
import type { ChatListDTO } from "../../../types/chat/chat.dto";

const Chat: React.FC = () => {

    const [chats, setChats] = useState<ChatListDTO[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
      const timer = setTimeout(() => {
        chatService.getMyChats(search).then((res) => {
          setChats(res.data.chats);
        });
      }, 300);

      return () => clearTimeout(timer);
    }, [search]);

    const selectedChat = chats.find(c => c.id === selectedChatId) ?? null;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Chat container */}
      <div className="container mx-auto flex-1 py-2.5">
        <div className="h-[calc(98vh-4rem)]">
          <div className="flex rounded-xl shadow-2xl bg-white dark:bg-gray-800 h-full overflow-hidden">
            {/* Sidebar */}
            <ChatSidebar
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              search={search}
              onSearch={setSearch}
            />

            {/* Chat window */}
            {!selectedChat ?
              (
                <div className="w-3/4 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500">
                  Select a chat to start messaging
                </div>
              ) : (
                <ChatWindow selectedChat={selectedChat} />
              ) 
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;