import React from "react";
import InputSection from "../InputSection";
import DropdownSection from "../DropdownSection";
import Button from "../Button";

interface UserModalProps<T extends Record<string, string>> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => void;
  formData: T;
  onChange: (field: keyof T, value: string) => void;
  title?: string;
  errors?: Partial<Record<keyof T, string>>;
  fields?: {
    name: keyof T;
    label?: string;
    placeholder?: string;
    type?: string;
  }[];
  dropdowns?: {
    name: keyof T;
    label?: string;
    options: string[];
  }[];
  textAreas?: {
    name: keyof T;
    label?: string;
    placeholder?: string;
    rows?: number;
  }[];
  dateFields?: {
    name: keyof T;
    label?: string;
    placeholder?: string;
  }[];
  children?: React.ReactNode;
}

const UserModal = <T extends Record<string, string>>({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  title = "User Form",
  errors,
  fields,
  dropdowns,
  textAreas,
  dateFields,
  children,
}: UserModalProps<T>) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input fields */}
          {fields?.map(({ name, label, placeholder, type }) => (
            <div key={String(name)}>
              <InputSection<T>
                name={name}
                value={formData[name]}
                onChange={onChange}
                placeholder={placeholder}
                type={type}
                label={label}
                error={errors?.[name]}
              />
            </div>
          ))}

          {/* Dropdowns */}
          {dropdowns?.map(({ name, label, options }) => (
            <React.Fragment key={String(name)}>
              <DropdownSection<T>
                name={name}
                value={formData[name]}
                onChange={onChange}
                label={label}
                options={options}
              />
              {errors?.[name] && (
                <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
              )}
            </React.Fragment>
          ))}

          {/* Textareas */}
          {textAreas?.map(({ name, label, placeholder, rows = 4 }) => (
            <div key={String(name)}>
              {label && (
                <label
                  htmlFor={String(name)}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {label}
                </label>
              )}
              <textarea
                id={String(name)}
                value={formData[name]}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                           focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors?.[name] && (
                <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
              )}
            </div>
          ))}

          {/* Date fields */}
          {dateFields?.map(({ name, label, placeholder }) => (
            <div key={String(name)}>
              {label && (
                <label
                  htmlFor={String(name)}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {label}
                </label>
              )}
              <input
                type="date"
                id={String(name)}
                value={formData[name]}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 
                           focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors?.[name] && (
                <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
              )}
            </div>
          ))}

          {children && <div>{children}</div>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              label="Cancel"
              onClick={onClose}
              variant="secondary"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white 
                         bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            />
            <Button
              label="Submit"
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 
                         rounded hover:bg-indigo-700 dark:hover:bg-indigo-600"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;