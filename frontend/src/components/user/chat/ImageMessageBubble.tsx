interface ImageMessageBubbleProps {
  imageUrl: string;
  caption?: string;
  createdAt: string;
  isOwnMessage: boolean;
  onDownload: () => void;
}

const ImageMessageBubble: React.FC<ImageMessageBubbleProps> = ({
  imageUrl,
  caption,
  createdAt,
  isOwnMessage,
  onDownload,
}) => {
  return (

      <div className="flex flex-col gap-1 max-w-[326px]">
        <div
          className={`flex flex-col p-2 rounded-lg ${
            isOwnMessage
              ? "bg-indigo-900 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 text-xs">
            <span className="opacity-70">
              {new Date(createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {caption && (
            <p className="text-sm mb-2 break-words">{caption}</p>
          )}

          <div 
            onClick={onDownload}
            className="group relative">
            <div 
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-md">
            </div>

            <img
              src={imageUrl}
              alt="sent image"
              className="rounded-md max-h-80 object-cover"
            />
          </div>

          <span className="text-xs opacity-70 mt-1 self-end">
            Delivered
          </span>
        </div>
      </div>
  );
};

export default ImageMessageBubble;
