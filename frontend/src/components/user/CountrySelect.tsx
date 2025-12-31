import React, { useEffect, useState } from "react";
import Select, { type StylesConfig } from "react-select";

interface Option {
  label: string;
  value: string;
}

interface CountrySelectProps {
  formData: { locationCountry: string };
  handleChange: (field: string, value: string) => void;
  options: Option[];
}

const CountrySelect: React.FC<CountrySelectProps> = ({ formData, handleChange, options }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const styles: StylesConfig<Option, false> = {
    control: (base, state) => ({
      ...base,
      padding: "4px 6px",
      borderRadius: "8px",
      borderColor: state.isFocused
        ? isDarkMode ? "#60a5fa" : "#3b82f6"
        : isDarkMode ? "#374151" : "#d1d5db",
      backgroundColor: isDarkMode ? "#1f2937" : "#f3f4f6", // gray-800 / gray-100
      color: isDarkMode ? "#f9fafb" : "#111827",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      fontSize: "0.875rem",
      fontWeight: 500,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#111827" : "#ffffff",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
        ? isDarkMode ? "#374151" : "#f3f4f6"
        : "transparent",
      color: state.isSelected
        ? "#ffffff"
        : isDarkMode ? "#f9fafb" : "#111827",
      cursor: "pointer",
      fontSize: "0.875rem",
      padding: "8px 12px",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? "#f9fafb" : "#111827",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      ":hover": {
        color: isDarkMode ? "#f9fafb" : "#374151",
      },
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  return (
    <Select
      options={options}
      isSearchable
      placeholder="Select country"
      value={options.find((c) => c.value === formData.locationCountry) || null}
      onChange={(option) => handleChange("locationCountry", option?.value || "")}
      styles={styles}
    />
  );
};

export default CountrySelect;