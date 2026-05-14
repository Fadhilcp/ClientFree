import React, { type ReactNode } from "react";

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  children?: ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  type = "button",
  className,
  children
}) => {
  const baseClasses = className ? className :
    "px-4 py-2 rounded font-bold transition-colors duration-200";

  const variantClasses =
    variant === "primary"
      ? "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 hover:dark:bg-indigo-600"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button onClick={onClick} type={type} className={`${baseClasses} ${variantClasses}`}>
      {children ?? label}
    </button>
  );
};

export default Button;