import React, { useEffect, useRef, useState } from "react";
import ProfileImage from "../../../components/user/profile/ProfileImage";
import ProfileInfoItem from "../../../components/user/profile/ProfileInfoItem";
import ProfileHeader from "../../../components/user/profile/ProfileHeader";
import ProfileSection from "../../../components/user/profile/ProfileSection";
import InfoSection from "../../../components/user/profile/InfoSection";
import TagListSection from "../../../components/user/profile/TagListSection";
import { profileService } from "../../../services/profile.service";
import type { UserProfileDto } from "../../../types/user/userProfile.type";
import { notify } from "../../../utils/toastService";
import Loader from "../../../components/ui/Loader/Loader";
import type { ClientProfileDto } from "../../../types/user/clientProfile.dto";
import type { FreelancerProfileDto } from "../../../types/user/freelancerProfile.dto";
import type { SkillItem } from "../../../types/skill.types";
import ProfileModal from "./ProfileModal";
import { skillService } from "../../../services/skill.service";
import type { ProfileFormData } from "../../../types/profileModal.types";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { setUser } from "../../../features/authSlice";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  
  const fetchProfile = async () => {
    try {
      const response = await profileService.getMyProfile();
      if (response.data.success) {
        const user = response.data.user;
        dispatch(setUser(user));
        setProfileData(user);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to load profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handleCreateProfile = async (formData : FormData) => {
      setLoading(true);
      try {
          const response = await profileService.updateProfile(formData);
          if(response.data){

            fetchProfile();
            notify.success('Profile updated successfully')
            setIsModalOpen(false);
          }
      } catch (error : any) {
          notify.error(error.response?.data?.error || 'Failed to create profile');
      } finally {
          setLoading(false);
      }
  }

  if (loading || !profileData) return <Loader />;

  const { email, role, profileImage, username} = profileData;
  const isFreelancer = role === "freelancer";
  const isClient = role === "client";

  let name = username;

  // role specific fields
  let professionalTitle = "";
  let hourlyRate = "";
  let experienceLevel = "";
  let about = "";
  let description = "";
  let skills: SkillItem[] = [];
  let externalLinks: { type: string; url: string }[] = [];
  let company: ClientProfileDto["company"] | undefined;
  let location: { city?: string; state?: string; country?: string } | undefined;
  let stats: Record<string, number> = {};
  let ratingValue = "";

  if (isFreelancer) {
    const freelancer = profileData as FreelancerProfileDto;
    name = freelancer.name ?? username;
    professionalTitle = freelancer.professionalTitle ?? "";
    hourlyRate = freelancer.hourlyRate ?? "";
    about = freelancer.about ?? "";
    description = freelancer.description ?? "";
    experienceLevel = freelancer.experienceLevel ?? "";
    skills = freelancer.skills ?? [];
    externalLinks = freelancer.externalLinks ?? [];
    location = freelancer.location;
    stats = freelancer.stats;
    ratingValue = freelancer.ratings.asFreelancer.toFixed(1);
  } else if (isClient) {
    const client = profileData as ClientProfileDto;
    name = client.name ?? username;
    description = client.description ?? ""
    company = client.company;
    location = client.location;
    stats = client.stats;
    ratingValue = client.ratings.asClient.toFixed(1);
  }

  return (
  <>
   {/* Profile creation modal */}
        <ProfileModal open={isModalOpen}
          role={role === "freelancer" ? "freelancer" : "client" }
          onSave={handleCreateProfile}  
          onClose={()=> setIsModalOpen(false)}
          availableSkills={availableSkills}
          defaultValues={profileData as Partial<ProfileFormData>}
        />
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
      <div className="max-w-10xl mx-auto my-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-indigo-500 to-indigo-600 animate-gradient text-white p-6 md:p-10">
            {/* Edit Button in Top Right */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute top-4 right-4 bg-white text-indigo-600 font-semibold px-2 py-1 rounded-lg shadow hover:bg-indigo-50 transition"
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </button>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ProfileImage src={profileImage} />
              <ProfileHeader
                name={name}
                title={isFreelancer ? professionalTitle : ""}
                contacts={[{ icon: "", text: email }]}
              />
            </div>
          </div>


          {/* Main Content */}
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-2 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {isFreelancer ? (
                  <>
                    <ProfileInfoItem label="Hourly Rate" value={hourlyRate} />
                    <ProfileInfoItem label="Experience Level" value={experienceLevel} />
                    <ProfileInfoItem label="Jobs Completed" value={stats.jobsCompleted.toString()} />
                    <ProfileInfoItem label="Reviews Count" value={stats.reviewsCount.toString()} />
                    <ProfileInfoItem label="Total Earnings" value={`₹${stats.earningTotal}`} />
                    <ProfileInfoItem label="Rating" value={ratingValue} />
                  </>
                ) : (
                  <>
                    <ProfileInfoItem label="Jobs Posted" value={stats.totalProjectsPosted.toString()} />
                    <ProfileInfoItem label="Total Spent" value={`₹${stats.totalSpent}`} />
                    <ProfileInfoItem label="Rating" value={ratingValue} />
                  </>
                )}
              </div>

              {isFreelancer && about && <ProfileSection title="About" content={about} />}
              {description && <ProfileSection title="Description" content={description} />}

              {company && (
                <InfoSection
                  title="Company Details"
                  items={[
                    { label: "Company Name", value: company.name || "" },
                    { label: "Industry", value: company.industry || "" },
                    { label: "Website", value: company.website || "", link: true },
                  ]}
                />
              )}
            </div>

              
            {/* Right Column */}
            <div className="space-y-8">
              {isFreelancer  && (
                <TagListSection title="Skills" items={skills} />
              )}

              {location && (
                <InfoSection
                  title="Location"
                  items={[
                    { label: "City", value: location.city || "" },
                    { label: "State", value: location.state || "" },
                    { label: "Country", value: location.country || "" },
                  ]}
                />
              )}

              {externalLinks.length > 0 && (
                <InfoSection
                  title="External Links"
                  items={externalLinks.map((link) => ({
                    label: link.type,
                    value: link.url,
                    link: true,
                  }))}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default Profile;