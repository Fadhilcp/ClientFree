import type React from "react";

interface InputSectionProps<T extends Record<string, string>> {
  name: keyof T;
  value: string;
  onChange: ((field: keyof T, value: string) => void) | ((value : string) => void);
  type?: string;
  placeholder?: string;
  label?: string;
  error?: string;
}

function InputSection<T extends Record<string, string>>({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
}: InputSectionProps<T>) {

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if(onChange.length === 2){
      (onChange as (field: keyof T, value : string) => void)(name, inputValue);
    }else {
      (onChange as (value : string) => void)(inputValue);
    }
  }

  return (
    <div className="mt-3 w-full">
      <input
        id={String(name)}
        name={String(name)}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-4 rounded-lg font-medium bg-gray-100 border ${
          error ? 'border-red-500' : 'border-gray-200'
        } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default InputSection;