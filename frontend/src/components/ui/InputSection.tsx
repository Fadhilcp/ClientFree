import type React from "react";
import { useState } from "react";

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
  label,
  error,
  className
}: InputSectionProps<T>) {

  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

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
    focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-indigo-500
    ${isPassword ? "pr-10" : ""}
  `;

  const borderClass = error ? "border-red-500" : "border-gray-200 dark:border-gray-600";



  return (
    <div className="mt-3 w-full">
      {label && (
        <label
          htmlFor={String(name)}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
      <input
        id={String(name)}
        name={String(name)}
        type={inputType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${ className || baseClass } border ${borderClass}`}
      />
      {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <i className="fa-regular fa-eye-slash"></i> : <i className="fa-regular fa-eye"></i>}
          </button>
        )}

      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default InputSection;