import React from "react";
import type { AddOn } from "../../../types/admin/addOn.type";

interface AddOnListProps {
  addOns: AddOn[];
  selectedUpgradeId: string | null;
  onSelect: (id: string | null) => void;
}

const AddOnList: React.FC<AddOnListProps> = ({ addOns, selectedUpgradeId, onSelect }) => {
  if (!addOns || addOns.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        (No add-ons available currently)
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {/* No Upgrade option */}
      <li className="flex flex-col dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-4 hover:shadow-sm transition">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="optionalUpgrade"
            checked={selectedUpgradeId === null}
            onChange={() => onSelect(null)}
            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
          />
          <span className="font-medium text-gray-800 dark:text-gray-100">
            No Upgrade
          </span>
        </label>
      </li>

      {addOns.map((addon) => (
        <li
          key={addon.id}
          className="flex flex-col dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-4 hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="optionalUpgrade"
                checked={selectedUpgradeId === addon.id}
                onChange={() => onSelect(addon.id)}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {addon.displayName}
              </span>
            </label>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              ₹{addon.price}
            </span>
          </div>
          {addon.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {addon.description}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};

export default AddOnList;