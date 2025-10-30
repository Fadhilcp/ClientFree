import type React from "react";

interface InputSectionProps<T> {
  name: keyof T;
  value: string;
  onChange: ((field: keyof T, value: string) => void) | ((value : string) => void);
  type?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

function InputSection<T>({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  className
}: InputSectionProps<T>) {

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if(onChange.length === 2){
      (onChange as (field: keyof T, value : string) => void)(name, inputValue);
    }else {
      (onChange as (value : string) => void)(inputValue);
    }
  }


  const baseClass = `
    w-full px-3 py-4 rounded-lg font-medium
    bg-gray-100 dark:bg-gray-800
    placeholder-gray-500 dark:placeholder-gray-400
    text-sm text-gray-900 dark:text-gray-100
    focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
    focus:bg-white dark:focus:bg-gray-700
  `;

  const borderClass = error ? "border-red-500" : "border-gray-200 dark:border-gray-600";



  return (
    <div className="mt-3 w-full">
      <input
        id={String(name)}
        name={String(name)}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${ className || baseClass } border ${borderClass}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default InputSection;