import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface JobDetailProps {
  job: {
    id: string;
    title: string;
    skills: string[];
    category: string;
    subcategory: string;
    description: string;
    budget: string;
    createdAt: string;
    duration: string;
    status: "Open" | "Closed" | "In Progress";
    location: string;
  };
}

const JobDetailPage: React.FC<JobDetailProps> = ({ job }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    { key: "details", label: "Job Details" },
    { key: "proposals", label: "Proposals" },
    { key: "shortlist", label: "Shortlist" },
    { key: "invitations", label: "Invitations" },
  ];

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Top Section */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        {/* Tabs */}
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm font-medium ${
                activeTab === tab.key
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                  : "text-gray-600 dark:text-gray-300"
              } pb-1`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Job Status */}
        <span
          className={`px-3 py-1 text-sm rounded ${
            job.status === "Open"
              ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
              : job.status === "Closed"
              ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
          }`}
        >
          {job.status}
        </span>
      </div>


      {/* Job Details Section */}
      <div className="px-6 py-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {job.title}
        </h1>

        {/* Category + Subcategory */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {job.category} • {job.subcategory}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Location */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          📍 Location: {job.location}
        </p>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300">{job.description}</p>

        {/* Budget */}
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          Budget: {job.budget}
        </p>

        {/* Dates */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Created: {new Date(job.createdAt).toLocaleDateString()} • Duration:{" "}
          {job.duration}
        </p>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        {activeTab === "details" && (
          <p className="text-gray-600 dark:text-gray-300">
            Job details content goes here...
          </p>
        )}
        {activeTab === "proposals" && (
          <p className="text-gray-600 dark:text-gray-300">
            Proposals list goes here...
          </p>
        )}
        {activeTab === "shortlist" && (
          <p className="text-gray-600 dark:text-gray-300">
            Shortlisted freelancers go here...
          </p>
        )}
        {activeTab === "invitations" && (
          <p className="text-gray-600 dark:text-gray-300">
            Invitations list goes here...
          </p>
        )}
      </div>
    </section>
  );
};

// export default JobDetailPage;


const dummyJob = {
  id: "1",
  title: "Build a Full‑Stack Marketplace",
  skills: ["React", "Node.js", "TypeScript", "TailwindCSS"],
  category: "Web Development",
  subcategory: "Full Stack",
  description:
    "We need a skilled developer to build a scalable freelancer marketplace with modern UI and robust backend.",
  budget: "$1500",
  createdAt: "2025-11-15T00:00:00Z",
  duration: "3 months",
  status: "Open" as const,
  location: "Remote / Worldwide",
};

export default function DummyWrapper() {
  return <JobDetailPage job={dummyJob} />;
}
