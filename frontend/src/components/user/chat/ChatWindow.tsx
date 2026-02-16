import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { ChatListDTO } from "../../../types/chat/chat.dto";
import { messageService } from "../../../services/message.service";
import type { MessageDTO } from "../../../types/message/message.dto";
import { useEffect, useState } from "react";
import { notify } from "../../../utils/toastService";
import { socket } from "../../../config/socket.config";
import { useCall } from "../../../context/CallProvider";

interface ChatWindowProps {
  selectedChat: ChatListDTO;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedChat, onBack }) => {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const { startCall } = useCall();

  // join / leave chat room
  useEffect(() => {
    socket.emit("chat:join", selectedChat.id);
    return () => {
      socket.emit("chat:leave", selectedChat.id);
    };
  }, [selectedChat.id]);

  // blocked state
  useEffect(() => {
    setIsBlocked(selectedChat.isBlocked);
    setBlockReason(selectedChat.blockReason ?? null);
  }, [selectedChat.id]);

  // block status updates
  useEffect(() => {
    const handleBlockStatus = (data: {
      isBlocked: boolean;
      blockReason: string | null;
    }) => {
      setIsBlocked(data.isBlocked);
      setBlockReason(data.blockReason);
    };

    socket.on("chat:block-status", handleBlockStatus);
    return () => {
      socket.off("chat:block-status", handleBlockStatus);
    };
  }, []);

  // incoming messages
  useEffect(() => {
    const handleIncomingMessage = (message: MessageDTO) => {
      setMessages(prev =>
        prev.some(m => m.id === message.id) ? prev : [...prev, message]
      );
    };

    socket.on("chat:message", handleIncomingMessage);
    return () => {
      socket.off("chat:message", handleIncomingMessage);
    };
  }, []);

  // deleted message
  useEffect(() => {
    const handleDeleted = ({ messageId }: { messageId: string }) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId ? { ...m, isDeleted: true } : m
        )
      );
    };

    socket.on("chat:message:deleted", handleDeleted);
    return () => {
      socket.off("chat:message:deleted", handleDeleted);
    };
  }, []);

  // fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await messageService.getChatMessages(selectedChat.id);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err: any) {
        notify.error(err.response?.data?.error || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat.id]);

  useEffect(() => {
    const handleTyping = ({ userId, isTyping }: any) => {
      if (userId === selectedChat.otherUser.id) {
        setIsOtherTyping(isTyping);
      }
    };

    socket.on("chat:typing", handleTyping);
    return () => { 
      socket.off("chat:typing", handleTyping)
    };
  }, [selectedChat.id]);

  const handleSendMessage = async (data: {
    type: "text" | "voice" | "file";
    content?: string;
    file?: File;
    voice?: Blob;
  }) => {
    try {
      const formData = new FormData();
      formData.append("type", data.type);

      if (data.type === "text") formData.append("content", data.content || "");
      if (data.type === "file" && data.file) formData.append("file", data.file);
      if (data.type === "voice" && data.voice) {
        formData.append("file", data.voice, `voice-${Date.now()}.webm`);
      }

      await messageService.sendMessage(selectedChat.id, formData);
    } catch {
      notify.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col w-full bg-gray-50 dark:bg-gray-800">
      {/* Mobile back button */}
      {onBack && (
        <div className="md:hidden p-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg 
                      bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 
                      hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
        </div>
      )}

      <ChatHeader
        chat={selectedChat}
        disabled={isBlocked}
        isOtherTyping={isOtherTyping}
        onStartCall={() =>
          startCall(
            selectedChat.id,
            selectedChat.otherUser.id // userId of receiver 
          )
        }
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading messages...
        </div>
      ) : (
        <MessageList messages={messages} />
      )}

      {isBlocked ? (
        <div className="px-4 py-5 border-t text-sm text-center text-yellow-700">
          {blockReason === "subscription_expired"
            ? "Chat is blocked because subscription expired."
            : "Chat is currently blocked."}
        </div>
      ) : (
        <MessageInput chatId={selectedChat.id} onSend={handleSendMessage} />
      )}
    </div>
  );
};

export default ChatWindow;
