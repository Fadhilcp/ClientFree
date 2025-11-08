import React, { useEffect, useState } from "react";
import Select, { type StylesConfig, type MultiValue, type GroupBase } from "react-select";

export interface ISkillOption {
  _id: string;
  name: string;
}

interface SkillsSelectProps {
  value: string[];
  error?: string;
  onChange: (skills: string[]) => void;
  options: ISkillOption[];
}

const SkillsSelect: React.FC<SkillsSelectProps> = ({
  value,
  error,
  onChange,
  options,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // for dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const skillOptions = options.map((skill) => ({
    label: skill.name,
    value: skill._id,
  }));

  const selectedOptions = skillOptions.filter((skill) =>
    value.includes(skill.value)
  );

  // 🎨 Styling for light/dark modes
  const style: StylesConfig<{ label: string; value: string }, true> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb", // gray-800 / gray-50
      borderColor: state.isFocused
      ? isDarkMode
      ? "#60a5fa"
      : "#3b82f6"
      : isDarkMode
      ? "#374151"
      : "#e5e7eb",
      borderRadius: "0.5rem",
      padding: "0.5rem",
      fontSize: "0.875rem",
      color: isDarkMode ? "#f3f4f6" : "#111827",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: isDarkMode ? "#60a5fa" : "#3b82f6",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#111827" : "#ffffff",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
      ? isDarkMode
      ? "#374151"
      : "#eff6ff"
      : isDarkMode
        ? "#111827"
        : "#ffffff",
      color: isDarkMode ? "#f3f4f6" : "#111827",
      cursor: "pointer",
      fontSize: "0.875rem",
      padding: "0.5rem 0.75rem",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "#dbeafe",
      borderRadius: "0.375rem",
      padding: "2px 6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDarkMode ? "#bfdbfe" : "#1e3a8a",
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDarkMode ? "#93c5fd" : "#1e3a8a",
      ":hover": {
        backgroundColor: isDarkMode ? "#1e3a8a" : "#bfdbfe",
        color: "white",
      },
    }),
    input: (base) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "#111827",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    }),
  };

  return (
    <div>
      <label className="block font-semibold mb-1 text-gray-800 dark:text-gray-100">
        Skills
      </label>
      <Select<{ label: string; value: string }, true, GroupBase<{ label: string; value: string }>>
        isMulti
        name="skills"
        options={skillOptions}
        value={selectedOptions}
        onChange={(selected: MultiValue<{ label: string; value: string }>) => {
          const updatedSkills = selected.map((s) => s.value);
          onChange(updatedSkills);
        }}
        styles={style}
        classNamePrefix="react-select"
        placeholder="Search and select skills..."
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SkillsSelect;