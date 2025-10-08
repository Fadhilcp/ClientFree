interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const SelectSection: React.FC<SelectFieldProps> = ({ label, error, options, ...props }) => (
  <div className="mb-4">
    <label className="block font-semibold mb-1 text-gray-800 dark:text-gray-200">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-4 rounded-lg font-medium 
        bg-gray-100 dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        text-sm text-gray-900 dark:text-white 
        placeholder-gray-500 dark:placeholder-gray-400 
        focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 
        focus:bg-white dark:focus:bg-gray-900"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>

);
