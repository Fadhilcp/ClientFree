import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobService } from "../../../services/job.service";
import type { JobDetailDTO } from "../../../types/job/job.dto";
import PlaceBidPage from "../../../components/user/job/PlaceBidForm";
import JobDetails from "../../../components/user/job/JobDetails";
import JobHeader from "../../../components/user/job/JobHeader";

const JobDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [job, setJob] = useState<JobDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: "details", label: "Job Details" },
    { key: "proposals", label: "Proposals" },
    { key: "shortlist", label: "Shortlist" },
    { key: "invitations", label: "Invitations" },
  ];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await jobService.getJob(id);
        if (res.data.success) {
          setJob(res.data.job as JobDetailDTO);
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading job details...</p>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Job not found.</p>
      </section>
    );
  }

return (
  <section className="bg-white dark:bg-gray-900 min-h-screen flex justify-center py-6">
    <div className="w-full max-w-5xl border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 shadow-sm">
      {/* Top Section */}
      <JobHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        status={job.status}
        onBack={() => navigate(-1)}
      />

      {/* Conditional Rendering */}
      {activeTab === "details" && (
        <div className="p-6">
          <JobDetails job={job} />
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
          <PlaceBidPage jobId={job.id} />
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "proposals" && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Proposals
          </h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
            {job.proposals.length > 0 ? (
              job.proposals.map((p, i) => <li key={i}>{p}</li>)
            ) : (
              <li>No proposals yet.</li>
            )}
          </ul>
        </div>
      )}

      {activeTab === "shortlist" && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Shortlist
          </h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
            {job.acceptedProposalIds.length > 0 ? (
              job.acceptedProposalIds.map((id, i) => (
                <li key={i}>Accepted Proposal ID: {id}</li>
              ))
            ) : (
              <li>No shortlisted freelancers yet.</li>
            )}
          </ul>
        </div>
      )}

      {activeTab === "invitations" && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Invitations
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Invitations list goes here...
          </p>
        </div>
      )}
    </div>
  </section>
);
};

export default JobDetailPage;