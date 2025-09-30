// import React from 'react'
// import type { FormValues } from '../../pages/auth/signUp';

// interface InputSectionProps {
//   type ?: string;
//   name : keyof FormValues;
//   value : string;
//   onChange : (field : keyof FormValues, value : string) => void;
//   placeholder ?: string;
//   label ?: string;
//   error ?: string;
// }


// const InputSection : React.FC<InputSectionProps> = (
//   {type='text',name,value,onChange,placeholder,error}
// ) => {
//   return (
//     <div className="mt-3 w-full">
//       <input
//         id={name}
//         name={name}
//         type={type}
//         value={value}
//         onChange={(e) => onChange(name, e.target.value)}
//         placeholder={placeholder}
//         className={`w-full px-3 py-4 rounded-lg font-medium bg-gray-100 border ${
//           error ? 'border-red-500' : 'border-gray-200'
//         } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
//       />
//       {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
//     </div>
//   );

// }

// export default InputSection


import React from 'react';

interface InputSectionProps<T extends Record<string, string>> {
  name: keyof T;
  value: string;
  onChange: (field: keyof T, value: string) => void;
  type?: string;
  placeholder?: string;
  label?: string;
  error?: string;
}

// ✅ Declare the component as a generic function
function InputSection<T extends Record<string, string>>({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
}: InputSectionProps<T>) {
  return (
    <div className="mt-3 w-full">
      <input
        id={String(name)}
        name={String(name)}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
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