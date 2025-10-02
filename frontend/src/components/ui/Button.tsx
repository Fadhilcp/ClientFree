import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  type = "button",
}) => {
  const baseClasses =
    "px-4 py-2 rounded font-medium transition-colors duration-200";

  const variantClasses =
    variant === "primary"
      ? "bg-indigo-500 text-white hover:bg-indigo-700"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button onClick={onClick} type={type} className={`${baseClasses} ${variantClasses}`}>
      {label}
    </button>
  );
};

export default Button;
