import React, { useState } from "react";
import Button from "../../ui/Button";
import TextAreaSection from "../../ui/TextAreaSection";

interface Message {
  id: string;
  senderRole: "client" | "freelancer";
  senderName: string;
  content: string;
  timestamp: string;
}

interface ClarificationBoardProps {
  userRole: "client" | "freelancer"; // current logged-in role
  userName: string;
}

const ClarificationBoard: React.FC<ClarificationBoardProps> = ({ userRole, userName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderRole: "client",
      senderName: "Client A",
      content: "Please clarify the timeline for milestone 2.",
      timestamp: new Date().toLocaleString(),
    },
    {
      id: "2",
      senderRole: "freelancer",
      senderName: "Freelancer B",
      content: "Sure, I can deliver it by next Monday.",
      timestamp: new Date().toLocaleString(),
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: String(messages.length + 1),
      senderRole: userRole,
      senderName: userName,
      content: newMessage,
      timestamp: new Date().toLocaleString(),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Clarification Board
      </h2>

      {/* Messages */}
      <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-md ${
              msg.senderRole === "client"
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">{msg.senderName} ({msg.senderRole})</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{msg.timestamp}</span>
            </div>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
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
          label="Send"
          onClick={handleSendMessage}
          variant="primary"
          className="px-4 py-2"
        />
      </div>
    </div>
  );
};

export default ClarificationBoard;