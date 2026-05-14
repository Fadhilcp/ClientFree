import React, { type ReactNode } from "react";

interface AdminButtonProps {
    label?: string;
    onClick?: () => void;
    children?: ReactNode;
    type?: "button" | "submit" | "reset";
    className?: string;
}

const AdminButton: React.FC<AdminButtonProps> = ({
    label,
    onClick,
    type = "button",
    className = "",
    children,
}) => {
    return (
        <button
            onClick={onClick}
            type={type}
            className={`
                px-3 py-1
                text-xs font-medium
                rounded
                transition-colors duration-200
                ${className}
            `}
        >
            {children ?? label}
        </button>
    );
};

export default AdminButton;