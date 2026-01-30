import { useState } from "react";
import { messageService } from "../../../services/message.service";
import type { MessageDTO } from "../../../types/message/message.dto";

interface Props {
  message: MessageDTO;
  isMine: boolean;
  children: React.ReactNode;
}

const MessageActionsWrapper: React.FC<Props> = ({
  message,
  isMine,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await messageService.deleteMessage(message.id);
      setOpen(false);
    } catch {
      alert("Failed to delete message");
    }
  };

  return (
    <div
      className={`relative flex ${
        isMine ? "justify-end" : "justify-start"
      } group`}
    >
      {/* Toggle */}
      {isMine && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="opacity-0 group-hover:opacity-100 transition
                     ml-1 self-start p-1 rounded-md
                     text-gray-400 hover:text-gray-700
                     hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeWidth="2"
              d="M12 6h.01M12 12h.01M12 18h.01"
            />
          </svg>
        </button>
      )}

      {/* Dropdown */}
      {open && isMine && (
        <div
          className="absolute z-20 mt-6 right-0
                     bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700
                     rounded-md shadow-lg w-32"
        >
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm
                       text-red-600 hover:bg-gray-100
                       dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}

      {children}
    </div>
  );
};

export default MessageActionsWrapper;
