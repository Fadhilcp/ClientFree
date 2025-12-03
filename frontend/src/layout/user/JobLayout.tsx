import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/ui/SideBar";
import Button from "../../components/ui/Button";
import UserModal from "../../components/ui/Modal/UserModal";
import { skillService } from "../../services/skill.service";
import { notify } from "../../utils/toastService";
import SkillsSelect from "../../components/user/profileModal/SkillSelect";
import Loader from "../../components/ui/Loader/Loader";
import { type JobForm } from "../../types/job/job.dto";
import { jobService } from "../../services/job.service";
import { validateJobForm } from "../../utils/validators/jobForm";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { refreshJobs } from "../../features/jobSlice";

const clientMenuItems = [
  { label: "Active Jobs", path: "/my-jobs/active-jobs" },
  { label: "Posted Jobs", path: "/my-jobs/posted-jobs" },
  { label: "Completed Jobs", path: "/my-jobs/completed-jobs" },
  { label: "Invitations & Proposals", path: "/my-jobs/invitations-proposals" },
];

const freelancerMenuItems = [
  { label: "Active Jobs", path: "/my-jobs/active-jobs" },
  { label: "Task List", path: "/my-jobs/tasks" },
  { label: "Completed Jobs", path: "/my-jobs/completed-jobs" },
];

const jobFields = [
  { name: "title", label: "Job Title", placeholder: "Enter job title" },
  { name: "paymentBudget", label: "Budget", placeholder: "Enter budget" },
];

const jobDropdowns = [
  {
    name: "locationType",
    label: "Location Preference",
    options: ["specific", "worldwide"],
  },
  {
    name: "visibility",
    label: "Visibility",
    options: ["public", "private"],
  },
  {
    name: "category",
    label: "Category",
    options: [
      "Web Development",
      "Mobile Development",
      "Design",
      "Marketing",
      "Writing",
      "Other",
    ],
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

const locationFields = [
  { name: "locationCity", label: "City", placeholder: "Enter city" },
  { name: "locationCountry", label: "Country", placeholder: "Enter country" }
];

const JobLayout: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableSkills, setAvailableSkills] = useState<[]>([]);
    const [loading, setLoading] = useState(false);

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
      ...(formData.locationType === "specific" ? locationFields : [])
    ];
    
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
          const response = await jobService.createJob(payload);
          if(response.data.success){
              notify.success('Job created successfully');
              //to reload the new jobs list in child components
              dispatch(refreshJobs());
              resetForm();
          }
      } catch (error: any) {
          notify.error(error.response?.data?.error || "Failed to create job");
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
          </UserModal>
        </>
      )}

      {/* The layout start from here */}
      {/* Left column */}
      <div className="flex flex-col">
        {/* Button above sidebar */}
        {user?.role === "client" && (
          <div className="p-4 bg-white dark:bg-gray-900">
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
      <main className="flex-1 p-6 overflow-y-auto text-gray-800 dark:text-gray-200">
        <Outlet />
      </main>
    </div>
  );
};

export default JobLayout;