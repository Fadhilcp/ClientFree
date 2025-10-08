interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputSection: React.FC<InputProps> = ({ label, error, ...props }) => (
  <div className="mb-4">
    <label className="block font-semibold mb-1 text-gray-800 dark:text-gray-200">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-4 rounded-lg font-medium 
        bg-gray-100 dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        placeholder-gray-500 dark:placeholder-gray-400 
        text-sm text-gray-900 dark:text-white 
        focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 
        focus:bg-white dark:focus:bg-gray-900"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);