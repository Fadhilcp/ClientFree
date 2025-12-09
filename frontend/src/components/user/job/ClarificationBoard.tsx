import React, { useEffect, useState } from "react";
import Button from "../../ui/Button";
import TextAreaSection from "../../ui/TextAreaSection";
import { clarificationService } from "../../../services/clarification.service";
import { notify } from "../../../utils/toastService";
import MessageBubble from "../../ui/Card/MessageBubble";

interface Message {
  id: string;
  boardId: string;
  sender: {
    id: string;
    username: string;
    name: string;
    email: string;
    profileImage?: string;
    role: "client" | "freelancer";
  };
  senderRole: "freelancer" | "client";
  message: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ClarificationBoardProps {
  jobId: string;
}

const ClarificationBoard: React.FC<ClarificationBoardProps> = ({ jobId }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const [newMessage, setNewMessage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await clarificationService.getClarificationBoard(jobId);
        if (res.data.success) {
          const { messages } = res.data;
          setMessages(messages || []);
        }
      } catch (error: any) {
        console.error("Failed to load clarification board", error);
        notify.error(error.response?.data?.error || "Failed to load clarification board");
      }
    };
    fetchBoard();
  }, [jobId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    setLoading(true);
    try {
      const res = await clarificationService.addMessage(jobId, newMessage.trim());
      if (res.data.success) {
        const { message } = res.data;
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
      }
    } catch (error: any) {
      console.error("Failed to send message", error);
      notify.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Clarification Board
      </h2>

      {/* Messages */}
<div className="space-y-4 max-h-100 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4">
  {messages.length === 0 ? (
    <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet.</p>
  ) : (
    messages.map((msg) => (
      <MessageBubble
        key={msg.id}
        senderName={msg.sender.username}
        senderRole={msg.sender.role}
        profileImage={msg.sender.profileImage}
        content={msg.message}
        timestamp={new Date(msg.sentAt || msg.createdAt).toLocaleString()}
      />
    ))
  )}
</div>


      {/* Input */}
      <TextAreaSection
        name="clarification"
        value={newMessage}
        onChange={(val: string) => setNewMessage(val)}
        placeholder="Type your message..."
        label=""
        rows={3}
      />

      <div className="flex justify-end mt-3">
        <Button
          label={loading ? "Sending..." : "Send"}
          onClick={handleSendMessage}
          variant="primary"
          className="px-4 py-2 rounded-sm"
        />
      </div>
    </div>
  );
};

export default ClarificationBoard;