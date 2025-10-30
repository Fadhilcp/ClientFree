import React from 'react';
import InputSection from '../InputSection';
import Button from '../Button';
import DropdownSection from '../DropdownSection';

interface AdminModalProps<T extends Record<string, string>> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => void;
  formData: T;
  onChange: (field: keyof T, value: string) => void;
  title?: string;
  errors?: Partial<Record<keyof T, string>>;
  fields: {
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
}

const AdminModal = <T extends Record<string, string>>({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  title = 'Add Item',
  errors,
  fields,
  dropdowns,
}: AdminModalProps<T>) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ name, label, placeholder, type }) => (
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

          <div className="flex justify-end gap-3 pt-4">

            <Button label='Cancel' onClick={onClose} variant='secondary'
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            />
            <Button label='Save' type='submit'
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;