import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobService } from "../../../services/job.service";
import type { JobDetailDTO } from "../../../types/job/job.dto";
import JobHeader from "../../../components/user/job/JobHeader";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { notify } from "../../../utils/toastService";
import CenteredMessage from "../../../components/user/CenteredMessage";
import { jobAssignmentService } from "../../../services/jobAssignments.service";
import type { AssignmentDto } from "../../../types/job/assignment.type";
import InvitationsSection from "../../../components/user/job/InvitationSection";
import ProposalsSection from "../../../components/user/job/ProposalSection";
import ConfirmationModal from "../../../components/ui/Modal/ConfirmationModal";
import JobDetailsTab from "../../../components/user/job/JobDetailsTab";

const tabs = [
  { key: "details", label: "Job Details" },
  { key: "proposals", label: "Proposals" },
  { key: "invitations", label: "Invitations" },
];

const JobDetailPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [job, setJob] = useState<JobDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [jobAssignments, setJobAssignments] = useState<AssignmentDto[]>([]);

  // confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});

  // to find the user who post job
  const isJobOwner = user?.id === job?.client.id;
  const canStartJob = job?.status === "open" && 
  jobAssignments.some((a) =>
    a.milestones.some((m) => m.status === "funded")
  );
  // open confirm modal 
  const openConfirmModal = (title: string, description: string, action: () => void) => {
    setConfirmTitle(title);
    setConfirmDescription(description);
    setConfirmAction(() => action);
    setIsConfirmOpen(true);
  };

  const fetchAssignment = async () => {
    if(!id) return;
    const res = await jobAssignmentService.getAssignemntsOfJob(id);

    if (res.data.success) {
      const { assignments } = res.data;
      setJobAssignments(assignments);
    }
  };

  useEffect(() => {
    if (!id || activeTab !== 'details') return;

    let cancelled = false;
    setLoading(true)
    const load = async () => {
      try {
        const [jobRes, assignmentRes] = await Promise.all([
          jobService.getJob(id),
          jobAssignmentService.getAssignemntsOfJob(id),
        ]);
        if(cancelled) return;

        if (jobRes.data.success) setJob(jobRes.data.job);
        if (assignmentRes.data.success) setJobAssignments(assignmentRes.data.assignments);
      } catch (err) {
        notify.error('Failed to fetch job details');
      } finally {
        if(!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true };
  }, [id, activeTab]);

  const handleStartJob = async() => {
    try {
      if(!id) return;
      const response = await jobService.startJob(id);
      if(response.data.success){
        notify.success('Job activated');
        const { job } = response.data;
        setJob(prev => ({
          ...prev!,
          status: job.status,
          payment: { budget: job.payment.budget }
        }));
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Failed to activate job, Please try again');
    }
  }

  const handleViewProfile = (freelancerId: string) => {
    navigate(`/users/${freelancerId}`);
  }

  const handleCancelJob = async () => {
    if (!id) return;
    try {
      const res = await jobService.cancelJob(id);
      if (res.data.success) {
        notify.success("Job cancelled and escrow refunded successfully");
        setJob((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to cancel job");
    }
  };

  const handleDeleteJob = async () => {
    if (!id) return;
    try {
      const res = await jobService.deleteJob(id);
      if (res.data.success) {
        notify.success("Job deleted successfully");
        navigate(-1);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to delete job");
    }
  };

    if (loading) {
      return <CenteredMessage message="Loading job details..." />;
    }
    if (!job) {
      return <CenteredMessage message="Job not found." />;
    }
    if (!isJobOwner && user?.role === "client") {
      return <CenteredMessage message="You cannot view jobs posted by other clients." />;
    }

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen flex justify-center py-10 px-4">
      <div className="w-full max-w-6xl rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isConfirmOpen}
          title={confirmTitle}
          description={confirmDescription}
          onConfirm={() => {
            confirmAction();
            setIsConfirmOpen(false);
          }}
          onCancel={() => setIsConfirmOpen(false)}
        />

        {/* Top Section */}
        <JobHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          status={job.status}
          onBack={() => navigate(-1)}
          isJobOwner={isJobOwner}
          onCancelJob={() =>
          openConfirmModal(
              "Cancel Job",
              "Are you sure you want to cancel this job?",
              handleCancelJob
            )
          }
          onDeleteJob={() =>
            openConfirmModal(
              "Delete Job",
              "Are you sure you want to delete this job?",
              handleDeleteJob
            )
          }
        />

        {/* Job Details */}
        {activeTab === "details" && (
          <JobDetailsTab
            job={job}
            user={user}
            isJobOwner={isJobOwner}
            jobAssignments={jobAssignments}
            setJobAssignments={setJobAssignments}
            fetchAssignment={fetchAssignment}
            canStartJob={canStartJob}
            handleStartJob={handleStartJob}
            navigate={navigate}
            handleViewProfile={handleViewProfile}
          />
        )}

        {/* Proposals Section */}
        {activeTab === "proposals" && (
          <ProposalsSection
            jobId={job.id}
            jobStatus={job.status}
            isJobOwner={isJobOwner}
            user={user}
          />
        )}

        {/* Invitations Section */}
        {activeTab === "invitations" && (
          <InvitationsSection
            jobStatus={job.status}
            jobId={job.id}
            isJobOwner={isJobOwner}
          />
        )}
      </div>
    </section>
  );
};

export default JobDetailPage;