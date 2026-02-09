import React from "react";
import ProfileImage from "./profile/ProfileImage";
import Button from "../ui/Button";
import type { EducationItem, PortfolioItem, Resume } from "../../types/user/freelancerProfile.dto";

interface SkillItem {
  _id: string;
  name: string;
}

export interface UserDetailDto {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "client" | "freelancer" | "admin";
  professionalTitle?: string;
  about?: string;
  description?: string;
  skills?: SkillItem[];
  ratings?: {
    asFreelancer: number;
  };
  profileImage?: string;
  status?: string;
  hourlyRate?: string;
  experienceLevel?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  phone?: string;
  portfolio?: PortfolioItem[];
  resume?: Resume;
  education?: EducationItem[];
  stats?: {
    jobsCompleted: number;
    reviewsCount: number;
    earningTotal: number;
  };
  externalLinks?: {
    label: string;
    url: string;
  }[];
  createdAt?: string;
}

interface Props {
  user: UserDetailDto;
  onBack: () => void;
}

const UserDetailsSection: React.FC<Props> = ({ user, onBack }) => {
  return (
    <>
        {/* Back Button */}
        <div className="max-w-6xl mx-auto mb-6 flex">
        <Button
            onClick={onBack}
            variant="secondary"
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 
                    dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 shadow-sm transition-all duration-200"
        >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </Button>
        </div>

        {/* Profile Card */}
        <div className="max-w-6xl mx-auto mt-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 
                bg-gradient-to-r from-indigo-50 via-white to-indigo-100 
                dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 
                p-8 border border-gray-100 dark:border-gray-700">
        
        {/* Profile Header */}
        <div className="flex items-center gap-8 mb-8">
            <ProfileImage src={user.profileImage} useAuthFallback size={120} className="rounded-full shadow-md ring-2 ring-indigo-500" />
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {user.name || user.username}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.professionalTitle || user.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                {user.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <i className="fa-solid fa-phone text-indigo-500"></i> {user.phone}
                    </p>
                )}
            </div>
        </div>

        {/* Skills */}
        {user.skills && user.skills?.length > 0 && (
            <div className="mb-4">
            {/* <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Skills</h2> */}
            <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                    <span
                        key={skill._id}
                        className="px-4 py-2 text-sm font-semibold rounded-sm bg-indigo-50 text-indigo-700 
                        dark:bg-indigo-800 dark:text-indigo-300 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        {skill.name}
                    </span>
                ))}
            </div>
            </div>
        )}
        {/* About / Description */}
        {user.about && (
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">About</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.about}</p>
            </div>
        )}
        {user.description && (
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Description</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{user.description}</p>
            </div>
        )}


        {/* Ratings / Status / Joined */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {user.ratings && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                    <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        Ratings
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        {user.ratings.asFreelancer} / 5
                    </p>
                </div>
            )}

            {user.status && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                    <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        Status
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">{user.status}</p>
                </div>
            )}

            {user.createdAt && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                    <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        Joined
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
            {/* Stats */}
            {user.stats && (
                <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Stats</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        Jobs Completed: {user.stats.jobsCompleted} | Reviews: {user.stats.reviewsCount} | Earnings: ₹{user.stats.earningTotal}
                    </p>
                </div>
            )}
        {/* Experience + Hourly Rate */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.experienceLevel && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Experience Level</h2>
                    <p className="text-gray-700 dark:text-gray-300">{user.experienceLevel}</p>
                </div>
            )}
            {user.hourlyRate && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Hourly Rate</h2>
                    <p className="text-gray-700 dark:text-gray-300">₹ {user.hourlyRate}</p>
                </div>
            )}
        </div>

        {/* Resume */}
        {user.resume && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Resume</h2>
                <a
                    href={user.resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    View Resume
                </a>
                <p className="text-xs text-gray-300 mt-1">
                    Uploaded on {new Date(user.resume.uploadedAt).toLocaleDateString()}
                </p>
            </div>
        )}

        {/* Location */}
        {user.location && (
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Location</h2>
                <p className="text-gray-700 dark:text-gray-300">
                    {user.location.city}, {user.location.state}, {user.location.country}
                </p>
            </div>
        )}

        {/* External Links */}
        {user.externalLinks && user.externalLinks?.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">External Links</h2>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    {user.externalLinks.map((link, idx) => (
                    <li key={idx}>
                        <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                        {link.label || link.url}
                        </a>
                    </li>
                    ))}
                </ul>
            </div>
        )}

        {/* Portfolio */}
        {user.portfolio && user.portfolio?.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Portfolio</h2>
                <ul className="space-y-3">
                    {user.portfolio.map((item, idx) => (
                    <li key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                        <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{item.title}</p>
                        {item.link && (
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Visit link
                        </a>
                        )}
                    </li>
                    ))}
                </ul>
            </div>
        )} 

        {/* Education */}
        {user.education && user.education?.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Education</h2>
                <ul className="space-y-3">
                    {user.education.map((edu, idx) => (
                    <li key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                        <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{edu.degree}</p>
                        <p className="text-md text-gray-700 dark:text-gray-300">{edu.institution}</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                            {edu.startYear} – {edu.endYear ?? "Present"}
                        </p>
                    </li>
                    ))}
                </ul>
            </div>
        )}
        </div>
    </>
  );
};

export default UserDetailsSection;