import { useEffect, useState } from "react";
import { userService } from "../../services/user.service";

interface UserOption {
  id: string;
  label: string;
}

interface UserSearchSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({ value, onChange }) => {
  console.log("🚀 ~ UserSearchSelect ~ value:", value)
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selected, setSelected] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value.length) {
      setSelected([]);
      return;
    }

    const fetchSelected = async () => {
      const res = await userService.getUsersByIds(value);
      setSelected(res.data.users);
    };

    fetchSelected();
  }, [value]);

  useEffect(() => {
    if (!query.trim()) {
      setOptions([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await userService.searchUsers(query, 1, 10);
        setOptions(res.data.users);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const toggle = (id: string) => {
    onChange(
      value.includes(id)
        ? value.filter(v => v !== id)
        : [...value, id]
    );
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Users
      </label>

      {/* Selected users */}
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                        bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300
                        border border-indigo-200 dark:border-indigo-700 shadow-sm"
            >
              {u.label}
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full px-3 py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 
                  text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 
                  focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 
                  focus:ring-1 focus:ring-indigo-500"
      />

      {/* Options list */}
      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
        {loading && (
          <p className="p-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {options.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer 
                      hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => toggle(u.id)}
          >
            <input
              type="checkbox"
              checked={value.includes(u.id)}
              readOnly
              className="accent-indigo-600 dark:accent-indigo-500"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">{u.label}</span>
          </div>
        ))}

        {options.length === 0 && !loading && (
          <p className="p-2 text-sm text-gray-500 dark:text-gray-400">No users found</p>
        )}
      </div>
    </div>
  );
};


export default UserSearchSelect;