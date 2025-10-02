import React, { useState, useEffect } from "react";
import ProfileImage from "../../../components/user/profile/ProfileImage";
import { InputSection } from "../../../components/user/profileModal/InputSection";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  role: "freelancer" | "client";
  defaultValues?: any; 
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  onSave,
  role = 'client',
  defaultValues,
}) => {
  const emptyExternalLink = { type: "website", url: "" };

  const [formData, setFormData] = useState<any>({
    // Common fields
    name: "",
    phone: "",
    description: "",
    profileImage: "",
    location: { city: "", state: "", country: "" },

    // Freelancer fields
    skills: [],
    professionalTitle: "",
    portfolio: { portfolioFile: "", resume: "" },
    hourlyRate: "",
    about: "",
    experienceLevel: "beginner",
    externalLinks: [emptyExternalLink],

    // Client fields
    company: { name: "", industry: "", website: "" },
  });

  useEffect(() => {
    if (defaultValues) {
      setFormData({
        ...formData,
        ...defaultValues,
        location: { ...formData.location, ...defaultValues.location },
        portfolio: { ...formData.portfolio, ...defaultValues.portfolio },
        company: { ...formData.company, ...defaultValues.company },
        externalLinks: defaultValues.externalLinks?.length
          ? defaultValues.externalLinks
          : [emptyExternalLink],
      });
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
    onSave(formData);
    onClose();
  };

  const inputClass =
    "w-full px-3 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white";

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
          <InputSection label="Name" name="name" value={formData.name} onChange={handleChange}/>

          <InputSection label="Name" name="name" value={formData.name} onChange={handleChange}/>

          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={inputClass}
            />
          </div>

          {/* Location */}
          <InputSection label="City" name="location.city" value={formData.location.city} onChange={handleChange}/>
          <InputSection label="State" name="location.city" value={formData.location.state} onChange={handleChange}/>
          <InputSection label="Country" name="location.city" value={formData.location.country} onChange={handleChange}/>

          {/* Freelancer Only */}
          {role === "freelancer" && (
            <>
              <InputSection label="Professional Title" name="professionalTitle" value={formData.professionalTitle} onChange={handleChange}/>

              <div>
                <label className="block font-semibold mb-1">Hourly Rate</label>
                <input type="text" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className="block font-semibold mb-1">Experience Level</label>
                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className={inputClass}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">About</label>
                <textarea name="about" value={formData.about} onChange={handleChange} rows={3} className={inputClass} />
              </div>

              {/* External Links */}
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2">External Links</label>
                {formData.externalLinks.map((link: any, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={link.type}
                      onChange={(e) => {
                        const updatedLinks = [...formData.externalLinks];
                        updatedLinks[index].type = e.target.value;
                        setFormData({ ...formData, externalLinks: updatedLinks });
                      }}
                      className={`${inputClass} w-1/3`}
                    >
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="website">Website</option>
                      <option value="dribbble">Dribbble</option>
                      <option value="behance">Behance</option>
                      <option value="twitter">Twitter</option>
                    </select>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        const updatedLinks = [...formData.externalLinks];
                        updatedLinks[index].url = e.target.value;
                        setFormData({ ...formData, externalLinks: updatedLinks });
                      }}
                      placeholder="https://example.com"
                      className={`${inputClass} w-2/3`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedLinks = formData.externalLinks.filter((_: any, i: number) => i !== index);
                        setFormData({ ...formData, externalLinks: updatedLinks });
                      }}
                      className="px-2 bg-red-500 text-white rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, externalLinks: [...formData.externalLinks, emptyExternalLink] })
                  }
                  className="mt-2 px-3 py-2 bg-blue-600 text-white rounded"
                >
                  + Add Link
                </button>
              </div>

              {/* Portfolio & Resume */}
              <div>
                <label className="block font-semibold mb-1">Portfolio File</label>
                <input type="text" name="portfolio.portfolioFile" value={formData.portfolio.portfolioFile} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className="block font-semibold mb-1">Resume</label>
                <input type="text" name="portfolio.resume" value={formData.portfolio.resume} onChange={handleChange} className={inputClass} />
              </div>
            </>
          )}

          {/* Client Only */}
          {role === "client" && (
            <>
              <div>
                <label className="block font-semibold mb-1">Company Name</label>
                <input type="text" name="company.name" value={formData.company.name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Industry</label>
                <input type="text" name="company.industry" value={formData.company.industry} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Website</label>
                <input type="text" name="company.website" value={formData.company.website} onChange={handleChange} className={inputClass} />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
