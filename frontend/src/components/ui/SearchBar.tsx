import React from "react";
import Button from "./Button";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search...", onSearch }) => {
  const [value, setValue] = React.useState("");

  // Debounce effect: waits 500ms after typing stops
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (value.trim() !== "") {
        onSearch(value);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [value, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value); // immediate search on button click
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                   focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 font-light"
      />
      <Button
      label="Search"
      onClick={() => {}}
        type="submit"
        className="px-3 py-2 text-sm rounded-md"
      />
    </form>
  );
};

export default SearchBar