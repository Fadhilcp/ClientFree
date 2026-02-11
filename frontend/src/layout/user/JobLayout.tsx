import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/ui/SideBar";
import Button from "../../components/ui/Button";
import UserModal from "../../components/ui/Modal/UserModal";
import { skillService } from "../../services/skill.service";
import { notify } from "../../utils/toastService";
import SkillsSelect from "../../components/user/profileModal/SkillSelect";
import Loader from "../../components/ui/Loader/Loader";
import { type JobDetailDTO, type JobForm } from "../../types/job/job.dto";
import { jobService } from "../../services/job.service";
import { validateJobForm } from "../../utils/validators/jobForm";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { refreshJobs } from "../../features/jobSlice";
import { JOB_CATEGORIES } from "../../constants/jobCategories";
import { COUNTRIES } from "../../constants/countries";
import InputSection from "../../components/ui/InputSection";
import CountrySelect from "../../components/user/CountrySelect";
import FiilterBox from "../../components/ui/FiilterBox";

const clientMenuItems = [
  { label: "Active Jobs", path: "/my-jobs/active-jobs" },
  { label: "Posted Jobs", path: "/my-jobs/posted-jobs" },
  { label: "Completed Jobs", path: "/my-jobs/completed-jobs" },
  { label: "Invitations & Proposals", path: "/my-jobs/proposals-invitations" },
];

const freelancerMenuItems = [
  { label: "Active Jobs", path: "/my-jobs/active-jobs" },
  { label: "Hired Jobs", path: "/my-jobs/hired-jobs" },
  { label: "Completed Jobs", path: "/my-jobs/completed-jobs" },
  { label: "Task List", path: "/my-jobs/tasks" },
];

const jobFields = [
  { name: "title", label: "Job Title", placeholder: "Enter job title" },
  { name: "paymentBudget", label: "Budget", placeholder: "Enter budget" },
];

const jobDropdowns = [
  {
    name: "visibility",
    label: "Visibility",
    options: ["public", "private"],
  },
  {
    name: "category",
    label: "Category",
    options: [...JOB_CATEGORIES],
  },
  {
    name: "subcategory",
    label: "Subcategory",
    options: [
      "MERN Stack",
      "React",
      "Node.js",
      "Flutter",
      "UI/UX",
      "General",
    ],
  },
  {
    name: "paymentType",
    label: "Payment Type",
    options: ["fixed", "hourly"],
  },
  {
    name: "locationType",
    label: "Location Preference",
    options: ["specific", "worldwide"],
  },
];

const jobTextAreas = [
  {
    name: "description",
    label: "Job Description",
    placeholder: "Describe the job requirements...",
    rows: 5,
  },
];

const userDateFields = [
  { name: "duration", label: "Duration" }
];

const JobLayout: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableSkills, setAvailableSkills] = useState<[]>([]);
    const [loading, setLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editingJobId, setEditingJobId] = useState<string | null>(null);

    const [showMobileFilter, setShowMobileFilter] = useState(false);

    const [formData, setFormData] = useState<JobForm>({
        title: "",
        category: "",
        subcategory: "",
        skills: [],
        duration: "",
        paymentBudget: "",
        paymentType: "fixed",
        description: "",
        visibility: "public",
        locationCity: "",
        locationCountry: "",
        locationType: "specific",
        isFeatured: false,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof JobForm, string>>>({});

    const location = useLocation();

    const hideFilterBox =
      location.pathname.includes("/my-jobs/proposals-invitations") ||
      location.pathname.includes("/my-jobs/tasks");

    const didFetchRef = useRef(false);
      useEffect(() => {
      if (!isModalOpen || didFetchRef.current) return;
      didFetchRef.current = true;

      const fetchSkills = async () => {
        setLoading(true);
        try {
          const res = await skillService.getActive();
          setAvailableSkills(res.data.skills);
        } catch(error: any) {
          notify.error(error.response?.data?.error || "Failed to load skills");
        } finally {
          setLoading(false);
        }
      };

      fetchSkills();
    }, [isModalOpen]);
    
    const handleChange = (field: keyof JobForm, value: string) => {
      if (field === "locationType") {
        if (value === "worldwide") {
          setFormData(prev => ({
            ...prev,
            locationType: "worldwide",
            locationCity: "",
            locationCountry: ""
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            locationType: "specific"
          }));
        }
        return;
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const computedFields = [
      ...jobFields,
    ];

    const startEditJob = (job: JobDetailDTO) => {
      setIsEditing(true);
      setEditingJobId(job.id);

      setFormData({
        title: job.title,
        category: job.category || "",
        subcategory: job.subcategory || "",
        skills: job.skills?.map(s => s.id) || [],
        duration: job.duration || "",
        paymentBudget: job.payment?.budget?.toString() || "",
        paymentType: job.payment?.type || "fixed",
        description: job.description || "",
        visibility: job.visibility,
        locationCity: job.locationPreference?.city || "",
        locationCountry: job.locationPreference?.country || "",
        locationType: job.locationPreference?.type || "specific",
        isFeatured: job.isFeatured,
      });

      setIsModalOpen(true);
    };
    
    const handleSubmit = async() => {

      const validation = validateJobForm(formData);
      setErrors(validation);

      if (Object.keys(validation).length > 0) {
        return; 
      }

      const payload = {
        title: formData.title,
        category: formData.category,
        subcategory: formData.subcategory,
        skills: formData.skills,
        duration: formData.duration,
        payment: {
          budget: formData.paymentBudget,
          type: formData.paymentType
        },
        description: formData.description,
        visibility: formData.visibility,
        isFeatured: formData.isFeatured,
        locationPreference: {
          city: formData.locationType === 'specific' ? formData.locationCity : "",
          country: formData.locationType === 'specific' ? formData.locationCountry : "",
          type: formData.locationType,
        }
      };

      try {
          let response;

          if(isEditing && editingJobId) {
            response = await jobService.updateJob(editingJobId, payload);
            notify.success("Job updated successfully");
          } else {
            response = await jobService.createJob(payload);
            notify.success("Job created successfully");
          }
          if(response.data.success){
              //to reload the new jobs list in child components
              dispatch(refreshJobs());
              resetForm();
          }
      } catch (error: any) {
          notify.error(
            error.response?.data?.error || 
            (isEditing ? "Failed to update job" : "Failed to create job") 
          );
      }
    };

    const handlePostJobModal = () => {
      if(!user?.isProfileComplete){
        notify.info("Complete your profile before posting a job.")
        return;
      }
      setIsModalOpen(true)
    }
    
    const resetForm = () => {
      setFormData({
          title: "",
          category: "",
          subcategory: "",
          skills: [],
          duration: "",
          paymentBudget: "",
          paymentType: "fixed",
          description: "",
          visibility: "public",
          locationCity: "",
          locationCountry: "",
          locationType: "specific",
          isFeatured: false,
      });
      setErrors({});
      setIsModalOpen(false);
      setEditingJobId(null);
      setIsModalOpen(false);
    };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900">
      { loading && <Loader/> }

      {user?.role === "client" && (
        <>
          <UserModal<JobForm>
            isOpen={isModalOpen}
            onClose={resetForm}
            onSubmit={handleSubmit}
            formData={formData}
            onChange={handleChange}
            title="Post Job"
            fields={computedFields}
            dropdowns={jobDropdowns}
            textAreas={jobTextAreas}
            dateFields={userDateFields}
            errors={errors}
          >
            <SkillsSelect
              title="Skills(Optional)"
              value={formData.skills}
              error={errors.skills}
              onChange={(skills) => setFormData({ ...formData, skills })}
              options={availableSkills}
            />

            {/* City Input */}
            {formData.locationType === "specific" && (
              <InputSection<JobForm>
                name="City"
                value={formData["locationCity"]}
                onChange={(val: string) => handleChange("locationCity", val)}
                placeholder="City"
                type="text"
                label="City"
                error={errors?.locationCity}
              />
            )}

            {formData.locationType === "specific" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>

                <CountrySelect 
                formData={formData} 
                handleChange={(key, value) => handleChange(key, value)}
                options={COUNTRIES}
                />

              {errors.locationCountry && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.locationCountry}
                </p>
              )}
              </div>
            )}

          </UserModal>
        </>
      )}

      {/* The layout start from here */}
      {/* Left column */}
      <div className="flex flex-col">
        {/* Button above sidebar */}
        {user?.role === "client" && (
          <div className="px-4 py-4 bg-white dark:bg-gray-900">
            <Button
              label="Post a Job"
              onClick={() => handlePostJobModal()}
              className="w-full rounded-sm p-1"
            />
          </div>
        )}
          {/* Sidebar itself */}
          <Sidebar items={user?.role === "client" ? clientMenuItems : freelancerMenuItems} />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-4 md:p-6 overflow-y-auto text-gray-800 dark:text-gray-200">
        {!hideFilterBox && (
          <div className="md:hidden mb-4 flex justify-end">
            <button
              onClick={() => setShowMobileFilter(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm
                        rounded-md bg-white dark:bg-gray-800"
            >
              <i className="fa-solid fa-filter text-indigo-500" />
              Filters
            </button>
          </div>
        )}

        <Outlet context={{ startEditJob }} />
      </main>

      {!hideFilterBox && (
        <div
          className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
            showMobileFilter ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setShowMobileFilter(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Sliding panel */}
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-xs no-scrollbar
                        bg-white dark:bg-gray-900 p-4 overflow-y-auto
                        transform transition-transform duration-300 ease-in-out
                        ${showMobileFilter ? "translate-x-0" : "translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                Filters
              </h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <i className="fa-solid fa-xmark text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <FiilterBox
              enabledFilters={["category", "budgetMin", "budgetMax", "location", "workMode", "skills", "sort"]}
            />
          </div>
        </div>
      )}

      {/* RIGHT FILTER BOX */}
      {!hideFilterBox && (
        <aside className="hidden md:block border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0 h-screen p-6">
          <FiilterBox
            enabledFilters={["category", "budgetMin", "budgetMax", "location", "workMode", "skills", "sort"]}
          />
        </aside>
      )}
    </div>
  );
};

export default JobLayout;