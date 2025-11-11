import React, { useState } from "react";

interface SettingSectionProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const SettingSection = ({
  title,
  description,
  children,
}: SettingSectionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b py-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div>
          <h3 className="text-indigo-600 dark:text-indigo-500 text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
           <i
          className={`fas ${
            open ? "fa-chevron-up" : "fa-chevron-down"
          } text-gray-500 text-sm`}
        />
      </div>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default SettingSection;