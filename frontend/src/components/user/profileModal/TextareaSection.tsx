interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextareaSection: React.FC<TextareaProps> = ({ label, error, ...props }) => (
  <div className="mb-4 md:col-span-2">
    <label className="block font-semibold mb-1 text-gray-800 dark:text-white">
      {label}
    </label>
    <textarea
      {...props}
      className="w-full px-3 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white
                dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:border-gray-500 dark:focus:bg-gray-900"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
