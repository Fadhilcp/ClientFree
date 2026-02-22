import React, { useEffect, useRef, useState } from "react";
import ProfileImage from "../../../components/user/profile/ProfileImage";
import ProfileInfoItem from "../../../components/user/profile/ProfileInfoItem";
import ProfileHeader from "../../../components/user/profile/ProfileHeader";
import ProfileSection from "../../../components/user/profile/ProfileSection";
import InfoSection from "../../../components/user/profile/InfoSection";
import TagListSection from "../../../components/user/profile/TagListSection";
import { userService } from "../../../services/user.service";
import type { UserProfileDto } from "../../../types/user/userProfile.type";
import { notify } from "../../../utils/toastService";
import Loader from "../../../components/ui/Loader/Loader";
import type { ClientProfileDto } from "../../../types/user/clientProfile.dto";
import type { EducationItem, FreelancerProfileDto, PortfolioItem, Resume } from "../../../types/user/freelancerProfile.dto";
import type { SkillItem } from "../../../types/skill.types";
import ProfileModal from "./ProfileModal";
import { skillService } from "../../../services/skill.service";
import type { ProfileFormData } from "../../../types/profileModal.types";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { setUser } from "../../../features/authSlice";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  const auth = useSelector((state: RootState) => state.auth);

  const isVerified =
    Boolean(auth.subscription?.features?.VerifiedBadge);
  
  const fetchProfile = async () => {
    try {
      const response = await userService.getMyProfile();
      if (response.data.success) {
        const user = response.data.user;
        dispatch(setUser(user));
        setProfileData(user);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to load profile");
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
          const response = await userService.updateProfile(formData);
          if(response.data){

            await fetchProfile();
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
  let phone = "";
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
  let portfolio: PortfolioItem[] = [];
  let resume: Resume | undefined;
  let education: EducationItem[] = [];

  if (isFreelancer) {
    const freelancer = profileData as FreelancerProfileDto;
    name = freelancer.name ?? username;
    phone = freelancer.phone ?? "";
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
    portfolio = freelancer.portfolio ?? [];
    resume = freelancer.resume; 
    education = freelancer.education ?? [];
  } else if (isClient) {
    const client = profileData as ClientProfileDto;
    name = client.name ?? username;
    phone = client.phone ?? "";
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
      <div className="max-w-6xl mx-auto">
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
                isVerified={isVerified}
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

              {resume?.fileUrl && (
                <ProfileSection title="Resume">
                  <div className="rounded-lg p-4 shadow-sm bg-gray-700 text-white">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline font-medium"
                    >
                      View Resume
                    </a>
                    <p className="text-sm text-gray-200 mt-1">
                      Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </ProfileSection>
              )}

              {portfolio.length > 0 && (
                <ProfileSection title="Portfolio">
                  <ul className="space-y-3">
                    {portfolio.map((item, idx) => (
                      <li
                        key={idx}
                        className="rounded-lg p-4 shadow-sm bg-gray-700 text-white"
                      >
                        <p className="font-semibold">{item.title}</p>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline text-blue-500"
                          >
                            Visit link
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </ProfileSection>
              )}

              
              {education.length > 0 && (
                <ProfileSection title="Education">
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4.5 top-0 h-full w-0.5 bg-blue-600"></div>

                    <ul className="space-y-6 ml-8">
                      {education.map((edu, idx) => (
                        <li key={idx} className="relative">
                          {/* Arrow dot */}
                          <div className="absolute -left-5 top-2 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></div>

                          <div className="rounded-lg p-4 shadow-sm bg-gray-700 text-white">
                            <p className="font-semibold">{edu.degree}</p>
                            <p className="text-sm text-gray-200">{edu.institution}</p>
                            <p className="text-xs text-gray-300">
                              {edu.startYear} – {edu.endYear}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ProfileSection>
              )}


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
              {phone && (
                <InfoSection title="Contact" items={[{ label: "Phone", value: phone }]} />
              )}

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