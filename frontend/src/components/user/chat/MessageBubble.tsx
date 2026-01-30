import { messageService } from "../../../services/message.service";
import type { MessageDTO } from "../../../types/message/message.dto";
import FileMessageBubble from "./FileMessageBubble";
import ImageMessageBubble from "./ImageMessageBubble";
import VoiceNoteBubble from "./VoiceNoteBubble";
import MessageActionsWrapper from "./MessageActionsWrapper";

interface MessageBubbleProps {
  message: MessageDTO;
  currentUserId: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
}) => {

  const isMine = message.senderId === currentUserId;

  if (message.isDeleted) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        <div
          className={`px-3 py-2 rounded-lg text-sm italic opacity-70
            ${isMine ? "bg-indigo-100 text-indigo-500 rounded-br-none" : "bg-gray-200 text-gray-500 rounded-bl-none"}
          `}
        >
          Message deleted
        </div>
      </div>
    );
  }
  
  if (message.type === "voice" && message.voice?.url) {
    return (
      <MessageActionsWrapper message={message} isMine={isMine}>

      <VoiceNoteBubble
        audioUrl={message.voice.url}
        isOwnMessage={isMine}
        createdAt={message.createdAt}
        />
      </MessageActionsWrapper>
    );
  }

  if (message.type === "file" && message.file) {

    if (message.file.type?.startsWith("image/") && message.file.url) {
      return (
          <MessageActionsWrapper message={message} isMine={isMine}>
            <ImageMessageBubble
              imageUrl={message.file.url}
              caption={message.content}
              createdAt={message.createdAt}
              isOwnMessage={isMine}
              onDownload={() => window.open(message.file?.url, "_blank")}
            />
          </MessageActionsWrapper>
      );
    }

    if(message.file.key) {
      return (
        <MessageActionsWrapper message={message} isMine={isMine}>
          <FileMessageBubble
            file={message.file}
            createdAt={message.createdAt}
            isOwnMessage={isMine}
            onDownload={async () => {
              const res = await messageService.getFileSignedUrl(message.id);
              window.open(res.data.url, "_blank");
            }}
          />
        </MessageActionsWrapper>
      );
    }
  }
  
  return (
    <MessageActionsWrapper message={message} isMine={isMine}>
    {/* Bubble */}
    <div
      className={`flex flex-col max-w-[60%] px-4 py-2 rounded-lg shadow-sm
        ${
          isMine
            ? "bg-indigo-900 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
        }`}
    >
      {/* Message text */}
      <p className="text-sm break-words whitespace-pre-wrap">
        {message.content}
      </p>

      {/* Time */}
      <span
        className={`text-[11px] mt-1 self-end ${
          isMine ? "text-indigo-200" : "text-gray-400"
        }`}
      >
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
    </MessageActionsWrapper>
  );
};

export default MessageBubble;