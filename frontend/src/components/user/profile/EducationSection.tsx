import type { Education, EducationError } from "../../../types/profileModal.types";
import Button from "../../ui/Button";
import { InputSection } from "../profileModal/InputSection";

interface EducationSectionProps {
  education: Education[];
  updateEducation: (
    index: number,
    key: keyof Education,
    value: string | number
  ) => void;
  removeEducation: (index: number) => void;
  addEducation: () => void;
  errors?: EducationError[];
}

const EducationSection = ({
  education,
  updateEducation,
  removeEducation,
  addEducation,
  errors
}: EducationSectionProps) => {
  return (
    <div className="space-y-4 border-t border-gray-700 py-6 md:col-span-2 ">
    <h3 className="font-semibold">Education</h3>
    {education.map((edu, i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
        <InputSection
            label="Degree"
            value={edu.degree}
            onChange={(e) => updateEducation(i, "degree", e.target.value)}
            error={errors?.[i].degree}
        />
        <InputSection
            label="Institution"
            value={edu.institution}
            onChange={(e) => updateEducation(i, "institution", e.target.value)}
            error={errors?.[i].institution}
        />
        <InputSection
            label="Start Year"
            type="number"
            value={edu.startYear}
            onChange={(e) => updateEducation(i, "startYear", e.target.value)}
            error={errors?.[i].startYear}
        />
        <InputSection
            label="End Year"
            type="number"
            value={edu.endYear || ""}
            onChange={(e) => updateEducation(i, "endYear", e.target.value)}
            error={errors?.[i].endYear}
        />
        <Button className="px-4 py-2 rounded font-bold transition-colors duration-200 w-fit" variant="secondary" label="Remove" onClick={() => removeEducation(i)} />
        </div>
    ))}
    <Button label="Add Education" onClick={addEducation} />
    </div>
  )
}

export default EducationSection
