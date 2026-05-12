import { useMemo } from "react";
import { COUNTRIES } from "../../../constants/countries";
import { JOB_DATE_FIELDS, JOB_DROPDOWNS, JOB_FIELDS, JOB_TEXTAREAS } from "../../../constants/jobFields";
import type { JobForm } from "../../../types/job/job.dto";
import InputSection from "../../ui/InputSection";
import UserModal from "../../ui/Modal/UserModal";
import CountrySelect from "../CountrySelect";

import SkillsSelect from "../profileModal/SkillSelect";
import { useJobConfig } from "../../../hooks/useJobCategories";
import AiSuggestionBox from "../AiSuggestionBox";

interface JobPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: JobForm;
  setFormData: React.Dispatch<React.SetStateAction<JobForm>>;
  errors: any;
  availableSkills: any[];
  isAiLoading?: boolean;
  onAiSuggest: () => void;
}

const JobPostForm: React.FC<JobPostFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    errors,
    availableSkills,
    isAiLoading,
    onAiSuggest
}) => {
    const { subcategories, categories } = useJobConfig()

    const dropdowns = useMemo(() => {
        return JOB_DROPDOWNS.map((dropdown) => {
            if (dropdown.name === "category") {
                return { ...dropdown, options: categories };
            }
            if (dropdown.name === "subcategory") {
                return { ...dropdown, options: subcategories };
            }
            return dropdown;
        });
    }, [categories, subcategories]);

    const handleChange = (field: keyof JobForm, value: any) => {
        if(field === "locationType" && value === "worldwide") {
            setFormData(prev => ({ ...prev, locationType: "worldwide", locationCity: "" }));
            return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    
    {formData.title.length > 3 && (
        <p className="text-[10px] text-indigo-500 font-medium mb-2 animate-fade-in">
            ✨ AI Suggestion is now available at the bottom!
        </p>
    )}
    return (
        <UserModal<JobForm>
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            formData={formData}
            onChange={handleChange}
            title="Post Job"
            fields={JOB_FIELDS}
            dropdowns={dropdowns}
            textAreas={JOB_TEXTAREAS}
            dateFields={JOB_DATE_FIELDS}
            errors={errors}
        >
        <SkillsSelect
                title="Skills(Optional)"
                value={formData.skills}
                error={errors.skills}
                onChange={(skills) => setFormData({ ...formData, skills })}
                options={availableSkills}
        />

        {formData.locationType === "specific" && (
            <>
            <InputSection<JobForm>
                name="City"
                value={formData.locationCity}
                onChange={(val: string) => handleChange("locationCity", val)}
                placeholder="City"
                type="text"
                label="City"
                error={errors?.locationCity}
            />
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <CountrySelect
                    formData={formData} 
                    handleChange={handleChange}
                    options={COUNTRIES}
                />
                {errors.locationCountry && (
                    <p className="text-red-500 text-sm mt-1">{errors.locationCountry}</p>
                )}
            </div>
            </>
        )}

            <AiSuggestionBox 
                onSuggest={onAiSuggest}
                isAiLoading={!!isAiLoading}
                hasTitle={formData.title.length > 0}
            />

        </UserModal>
    ); 
}

export default JobPostForm;