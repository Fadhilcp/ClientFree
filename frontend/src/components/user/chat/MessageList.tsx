import MessageBubble from "./MessageBubble";
import type { MessageDTO } from "../../../types/message/message.dto";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: MessageDTO[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  
  const { user } = useSelector((state: RootState) => state.auth);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if(!user) return null;

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-950  dark:via-gray-800  dark:to-gray-950 no-scrollbar">

      <div className="py-4 px-6 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 text-center">
            No messages yet
          </p>
        )}

        {
        messages
          .map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={user.id}
            />
          ))}

          <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;
