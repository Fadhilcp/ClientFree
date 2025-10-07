import React from "react";
import type { StylesConfig } from "react-select";
import Select from "react-select";

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

const SkillsSelect: React.FC<SkillsSelectProps> = ({ value, error, onChange, options }) => {
  const skillOptions = options.map((skill) => ({
    label: skill.name,
    value: skill._id,
  }));

  const selectedOptions = options
  .filter((skill) => value.includes(skill._id))
  .map((skill) => ({
    label: skill.name,
    value: skill._id,
  }));


  
  const style : StylesConfig<any, true> = {
    control: (base) => ({
      ...base,
      backgroundColor: "#f3f4f6",
      borderColor: "#e5e7eb",   
      borderRadius: "0.5rem",
      padding: "0.5rem",
      fontSize: "0.875rem",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#dbeafe", 
      color: "#1e3a8a",  
      fontWeight: "500",
      borderRadius: "0.375rem",
      padding: "2px 6px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#eff6ff" : "white", 
      color: "#374151", 
      fontSize: "0.875rem",
      padding: "0.5rem 0.75rem",
    }),
  }

  return (
    <div>
      <label className="block font-semibold mb-1">Skills</label>
      <Select
        isMulti
        name="skills"
        options={skillOptions}
        value={selectedOptions}
        onChange={(selected) => {
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
