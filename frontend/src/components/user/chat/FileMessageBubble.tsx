import type { MessageFileDTO } from "../../../types/message/message.dto";
import { formatFileSize, getFileExtension } from "../../../utils/chatFile.util";


interface FileMessageBubbleProps {
  file: MessageFileDTO;
  createdAt: string;
  isOwnMessage: boolean;
  onDownload?: (url: string) => void;
}

const FileMessageBubble: React.FC<FileMessageBubbleProps> = ({
  file,
  createdAt,
  isOwnMessage,
  onDownload,
}) => {
  return (
      <div
        className={`flex flex-col gap-1 max-w-[326px] p-2 rounded-lg
          ${
            isOwnMessage
              ? "bg-indigo-900 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
          }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 text-sm">
          <span className="opacity-70 text-xs">
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* File box */}
        <div className="flex items-start gap-3 mt-2 bg-black/5 dark:bg-white/10 rounded-md p-3">
          {/* Icon */}
          <div className="shrink-0">
            <i className="fa-solid fa-file-lines text-xl opacity-80"></i>
          </div>

          {/* File info */}
          <div className="flex-1">
            <p className="text-sm font-medium break-all">{file.name}</p>
            <p className="text-xs opacity-70 mt-1">
              {formatFileSize(file.size ?? 0)} • {getFileExtension(file.type ?? "file")}
            </p>
          </div>

          {/* Download */}
          <button
            onClick={() => onDownload?.(file.key ?? "")}
            className="p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition"
            title="Download"
          >
            <i className="fa-solid fa-download"></i>
          </button>
        </div>

        {/* Status */}
        <span className="text-xs opacity-70 mt-1 self-end">
          Delivered
        </span>
      </div>
  );
};

export default FileMessageBubble;
