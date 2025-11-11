import React, { useState } from "react";

const menuItems = [
  "Account & Security",
  "Subscription & Premium",
  "Payment Methods",
  "Notifications",
  "Role & Permissions",
];

const SettingSidebar: React.FC = () => {
  const [selected, setSelected] = useState("Account & Security");

  return (
    <div className="w-54 bg-gray-100 dark:bg-gray-800 p-4 border-r border-indigo-500">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Menu</h2>
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li
            key={item}
            onClick={() => setSelected(item)}
            className={`p-2 text-sm rounded cursor-pointer transition-colors ${
              selected === item
                ? "bg-indigo-100 text-indigo-600 font-medium dark:bg-indigo-500 dark:text-white"
                : "hover:bg-gray-200 text-gray-800 dark:hover:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SettingSidebar;