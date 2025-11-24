interface DropdownSectionProps<T> {
  name: keyof T;
  value: string;
  onChange: (field: keyof T, value: string) => void;
  label?: string;
  options: string[];
}

function DropdownSection<T extends Record<string, string>>({
  name,
  value,
  onChange,
  label,
  options
}: DropdownSectionProps<T>) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={String(name)}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={String(name)}
        name={String(name)}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-3 py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-sm text-gray-900
         dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-gray-400
          dark:focus:border-gray-500 focus:ring-1 focus:ring-indigo-500"
      >
        <option value="" disabled>
            {label ? `Select ${label}` : 'Select an option'}
        </option>

        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DropdownSection;