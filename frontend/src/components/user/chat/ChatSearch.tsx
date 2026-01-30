interface ChatSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const ChatSearch: React.FC<ChatSearchProps> = ({ value, onChange }) => {
  return (
    <div className="py-2 px-3 bg-gray-100 dark:bg-gray-800">
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 
                     text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search or start new chat"
        />
      </div>
    </div>
  );
};

export default ChatSearch;