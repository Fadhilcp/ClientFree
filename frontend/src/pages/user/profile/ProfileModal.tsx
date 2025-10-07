import React, { useState, useEffect } from "react";
import ProfileImage from "../../../components/user/profile/ProfileImage";
import { InputSection } from "../../../components/user/profileModal/InputSection";
import { TextareaSection } from "../../../components/user/profileModal/TextareaSection";
import { SelectSection } from "../../../components/user/profileModal/SelectSection";
import { ExternalLinks } from "../../../components/user/profileModal/ExternalLinks";
import Button from "../../../components/ui/Button";
import SkillsSelect from "../../../components/user/profileModal/SkillSelect";
import { notify } from "../../../utils/toastService";
import { validateProfileForm } from "../../../utils/validators";
import type { FormData, FormErrors } from "../../../types/profileModal.types";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  role: "freelancer" | "client";
  defaultValues?: Partial<FormData>; 
  availableSkills: [];
  email?: string;
  username?: string;
}


const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  onSave,
  role,
  defaultValues,
  availableSkills,
}) => {
  const emptyExternalLink = { type: "website", url: "" };

  const [formData, setFormData] = useState<FormData>({
  name: "",
  phone: "",
  description: "",
  profileImage: "",
  location: { city: "", state: "", country: "" },
  portfolio: { portfolioFile: "", resume: "" },
  skills: [],
  professionalTitle: "",
  hourlyRate: "",
  about: "",
  experienceLevel: "beginner",
  externalLinks: [{ type: "website", url: "" }],
  company: { name: "", industry: "", website: "" },
});


  const [errors, setErrors] = useState<FormErrors>({});




useEffect(() => {
  if (defaultValues) {
    setFormData((prev) => ({
      ...prev,
      ...defaultValues,
      location: { ...prev.location, ...defaultValues.location },
      portfolio: {
        portfolioFile: defaultValues?.portfolio?.portfolioFile || prev.portfolio.portfolioFile,
        resume: defaultValues?.portfolio?.resume || prev.portfolio.resume,
      },
      company: { ...prev.company, ...defaultValues.company },
      externalLinks: defaultValues.externalLinks?.length
        ? defaultValues.externalLinks
        : [emptyExternalLink],
    }));
  }
}, [defaultValues]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setFormData({ ...formData, location: { ...formData.location, [key]: value } });
    } else if (name.startsWith("company.")) {
      const key = name.split(".")[1];
      setFormData({ ...formData, company: { ...formData.company, [key]: value } });
    } else if (name.startsWith("portfolio.")) {
      const key = name.split(".")[1];
      setFormData({ ...formData, portfolio: { ...formData.portfolio, [key]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


const handleSave = () => {
  const validationErrors = validateProfileForm(formData, role);
  const hasErrors = Object.values(validationErrors).some((val) => {
    if (Array.isArray(val)) return val.some((e) => Object.keys(e).length > 0);
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return Boolean(val);
  });

  if (hasErrors) {
    setErrors(validationErrors);
    console.log(errors)
    notify.error('Please fix the highlighted errors');
    return;
  }

  setErrors({});
  onSave(formData);
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] overflow-y-auto p-6 md:p-10 z-10">
        <h2 className="text-2xl font-semibold mb-6">
          {defaultValues ? "Edit" : "Create"} {role === "freelancer" ? "Freelancer" : "Client"} Profile
        </h2>

        {/* Profile Image */}
        <div className="mb-6 bg-gradient-to-r from-indigo-500 to-indigo-600 animate-gradient text-white p-6 md:p-10 rounded-lg">
          <ProfileImage />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Common Fields */}
          <InputSection label="Name" name="name" value={formData.name} error={errors.name} onChange={handleChange}/>

          <InputSection label="Phone" name="phone" value={formData.phone}  error={errors.phone} onChange={handleChange}/>

          <TextareaSection 
              label="Description"
              name="description"
              value={formData.description}
              error={errors.description}
              onChange={handleChange}
              rows={3}
            />


          {/* Freelancer Only */}
          {role === "freelancer" && (
            <>
              <InputSection label="Professional Title" name="professionalTitle" value={formData.professionalTitle} error={errors.professionalTitle} onChange={handleChange}/>

              <InputSection label="Hourly Rate" name="hourlyRate" value={formData.hourlyRate} error={errors.hourlyRate} onChange={handleChange}/>

              <SelectSection
                label="Experience Level"
                name="experienceLevel"
                value={formData.experienceLevel}
                error={errors.experienceLevel}
                onChange={handleChange}
                options={[
                  { label: "Beginner", value: "beginner" },
                  { label: "Intermediate", value: "intermediate" },
                  { label: "Expert", value: "expert" },
                ]}
              />

              
            
              <SkillsSelect
                value={formData.skills}
                error={errors.skills}
                onChange={(skills) => setFormData({ ...formData, skills })}
                options={availableSkills}
              />


              <TextareaSection 
                label="About"
                name="about"
                value={formData.about}
                error={errors.about}
                onChange={handleChange}
                rows={3}
              />

              {/* External Links */}

              <ExternalLinks
                links={formData.externalLinks}
                error={errors}
                onChange={(i, updated) => {
                  const newLinks = [...formData.externalLinks];
                  newLinks[i] = updated;
                  setFormData({ ...formData, externalLinks: newLinks });
                }}
                onRemove={(i) => {
                  setFormData({ ...formData, externalLinks: formData.externalLinks.filter((_: any, idx: number) => idx !== i) });
                }}
              />

              {/* Portfolio & Resume */}
              <InputSection label="Portfolio File" name="portfolio.portfolioFile" 
              value={formData.portfolio.portfolioFile} error={errors.portfolio?.portfolioFile} onChange={handleChange}
              />

              <InputSection label="Resume" name="portfolio.resume" 
              value={formData.portfolio.resume} error={errors.portfolio?.resume} onChange={handleChange}
              />

            </>
          )}

          {/* Client Only */}
          {role === "client" && (
            <>
              
              <InputSection label="Company Name" name="company.name" value={formData.company.name}
              error={errors.company?.name} onChange={handleChange}/>
              
              <InputSection label="Industry" name="company.industry" value={formData.company.industry}
              error={errors.company?.industry} onChange={handleChange}/>
              
              <InputSection label="Website" name="company.website" value={formData.company.website}
              error={errors.company?.website} onChange={handleChange}/>
            </>
          )}
        </div>
          {/* Location */}
          <InputSection label="City" name="location.city" value={formData.location.city}
          error={errors.location?.city} onChange={handleChange}/>
          <InputSection label="State" name="location.state" value={formData.location.state}
          error={errors.location?.state} onChange={handleChange}/>
          <InputSection label="Country" name="location.country" value={formData.location.country}
          error={errors.location?.country} onChange={handleChange}/>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <Button label="Cancel" onClick={onClose} variant="secondary" />

          <Button label="Save" onClick={handleSave} variant="primary" />

        </div>

      </div>
    </div>
  );
};

export default ProfileModal;