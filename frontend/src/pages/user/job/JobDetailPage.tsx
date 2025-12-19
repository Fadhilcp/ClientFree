import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobService } from "../../../services/job.service";
import type { JobDetailDTO } from "../../../types/job/job.dto";
import PlaceBidPage from "../../../components/user/job/PlaceBidForm";
import JobDetails from "../../../components/user/job/JobDetails";
import JobHeader from "../../../components/user/job/JobHeader";
import { proposalService } from "../../../services/proposal.service";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import { formatDate } from "../../../utils/formatters";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { IProposal, ProposalStatus } from "../../../types/job/proposal.type";
import { notify } from "../../../utils/toastService";
import type { SkillItem } from "../../../types/skill.types";
import CenteredMessage from "../../../components/user/CenteredMessage";
import Button from "../../../components/ui/Button";
import { jobAssignmentService } from "../../../services/jobAssignments.service";
import MilestoneForm from "../../../components/user/job/MilestoneForm";
import type { AssignmentDto } from "../../../types/job/assignment.type";
import InvitationsSection from "../../../components/user/job/InvitationSection";
import ProposalsSection from "../../../components/user/job/ProposalSection";
import ClarificationBoard from "../../../components/user/job/ClarificationBoard";
import type { User } from "../../../features/authSlice";
import ConfirmationModal from "../../../components/ui/Modal/ConfirmationModal";
import { getUpgradeProposal } from "../../../utils/getUpgradeProposal";

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
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalFilter, setProposalFilter] = useState("all");
  const [invitations, setInvitations] = useState<IProposal[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  
  const [jobAssignments, setJobAssignments] = useState<AssignmentDto[]>([]);

  // confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});

  // to find the user who post job
  const isJobOwner = user?.id === job?.clientId;
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

  
  useEffect(() => {
    if (!id) return;
    if (job?.status === "active" && 
      (activeTab === "proposals" || activeTab === "invitations")) {
      setProposals([]);
      setInvitations([]);
      return; 
    }
  // for proposal and invitation 
  const fetchData = async () => {
    try {
      if (activeTab === "proposals") {
        setProposalsLoading(true);
        const res = await proposalService.getProposalsForJob(
          id,
          proposalFilter !== "all" ? proposalFilter : "",
          false
        );
        if (res.data.success) setProposals(res.data.proposals);
        setProposalsLoading(false);
      }
      if (activeTab === "invitations") {
        setInvitationsLoading(true);
        const res = await proposalService.getProposalsForJob(id, "", true);
        if (res.data.success) setInvitations(res.data.proposals);
        setInvitationsLoading(false);
      }
    } catch (err) {
      notify.error('Pleaes try again!')
      console.error("Failed:", err);
      setProposalsLoading(false);
      setInvitationsLoading(false);
    }
  };

  fetchData();
  }, [id, activeTab, proposalFilter, job?.status]);
  // polling of new proposal( every 20 seconds )
  useEffect(() => {
    if (!id || activeTab !== "proposals"|| job?.status !== "open") return;
    const interval = setInterval(async () => {
      try {
        const response = await proposalService.getProposalsForJob(
          id,
          proposalFilter !== "all" ? proposalFilter : "",
          false
        );
        if (response.data.success) setProposals(response.data.proposals);
      } catch (err) {
        console.error("Polling failed:", err);
      }
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, [id, activeTab, proposalFilter, job?.status]);
  // Fetch job details
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
        notify.error('Failed to fetch job details')
        console.error("Failed to fetch job details:", err);
      } finally {
        if(!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true };
  }, [id, activeTab]);

  const handleChangeStatus = async(proposalId: string, status: ProposalStatus) => {
    try { 
      let response = null
      if(status === 'accepted'){
        response = await proposalService.acceptProposal(proposalId);
      }else{
        response = await proposalService.updateProposalStatus(proposalId, status);
      }
      
      if(response.data.success){
        notify.success(`Proposal ${status}`);
       
        setProposals(prev =>
          prev.map(p => 
            p.id === proposalId ? { ...p, status } : p
          )
        );
        
        setInvitations(prev =>
          prev.map(p =>
            p.id === proposalId ? { ...p, status } : p
          )
        );
      }
    } catch (error: any) {
      console.error("Failed to update status:", error);
      notify.error(error.response?.data?.error || "Failed to update proposal status");
    }
  }

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
  
  const getProposalActions = (p: IProposal): ActionItem[] => {
    const viewAction = {
      label: "View",
    onClick: () => console.log("View proposal", p.id),
    variant: "secondary" as const,
  };
  
  if (!isJobOwner) return [viewAction];
  const actions: ActionItem[] = [viewAction];

  switch (p.status) {
    case "pending":
      case "invited":
      actions.push(
        {
          label: "Shortlist",
          onClick: () => handleChangeStatus(p.id, "shortlisted"),
          variant: "secondary" as const,
        },
        {
          label: "Accept",
          onClick: () => handleChangeStatus(p.id, "accepted"),
          variant: "primary" as const,
        }
      );
      break;

    case "shortlisted":
      actions.push({
        label: "Accept",
        onClick: () => handleChangeStatus(p.id, "accepted"),
        variant: "primary" as const,
      });
      break;

    case "accepted":
      break;

    case "rejected":
      break;
  }
  
  return actions;
  };


// props of proposal cards
  const getCardProps = (p: IProposal) => {
    const upgradeProps = getUpgradeProposal({
      proposal: p,
      userId: user?.id,
      isJobOwner,
    });
      
      return {
      user: p.freelancer ?? undefined,
        title: `Bid: ₹${p.bidAmount}`,
        subtitle: `Duration: ${p.duration}`,
        description: p.description,
        status: p.status,
        meta: [{ label: "Bid Amount", value: `₹${p.bidAmount}` }],
        tags:
          p.milestones?.map(
            m => `${m.title} - ₹${m.amount} - ${m.dueDate ? formatDate(m.dueDate) : ""}`
          ) || [],
        footer: `Created: ${new Date(
          p.createdAt
        ).toLocaleDateString()} • Updated: ${new Date(
          p.updatedAt
        ).toLocaleDateString()}`,
        actions: getProposalActions(p),
        ...upgradeProps
     }
  };

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
          <div className="p-8">
            <JobDetails job={job} />

            <div className="my-8 border-t border-gray-200 dark:border-gray-700 opacity-70"></div>

            {/* Freelancer not selected notice */}
            {user?.role === "freelancer" &&
              job.status === "active" &&
              !(job.acceptedProposals ?? []).some(
                (p) => p.freelancer && p.freelancer.id === user.id
              ) && (
                <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md shadow-sm">
                  You were not selected for this job.
                </div>
              )}

            {/* Hired Freelancers */}
            {isJobOwner &&
              job.acceptedProposals &&
              job.acceptedProposals.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                    {job.acceptedProposals.length > 1
                      ? "Hired Freelancers"
                      : "Hired Freelancer"}
                  </h2>
                  <div className="space-y-6">
                    {job.acceptedProposals.map((p: any) => (
                      <Card
                        key={p.id}
                        user={p.freelancer ?? undefined}
                        title={p.freelancer.professionalTitle || p.freelancer.name}
                        subtitle={`Bid: ₹${p.bidAmount} • Duration: ${p.duration}`}
                        description={p.description}
                        status={p.status}
                        tags={
                          p.freelancer.skills
                            ? p.freelancer.skills.map((s: SkillItem) => s.name)
                            : []
                        }
                        meta={[
                          { label: "Experience", value: p.freelancer.experienceLevel },
                          { label: "Hourly Rate", value: p.freelancer.hourlyRate },
                        ]}
                        footer={`Accepted on: ${new Date(
                          p.updatedAt
                        ).toLocaleDateString()}`}
                        actions={[
                          {
                            label: "View Profile",
                            onClick: () => handleViewProfile(p.freelancer.id),
                            variant: "secondary" as const,
                          },
                        ]}
                      />
                    ))}
                  </div>
                  <div className="my-8 border-t border-gray-200 dark:border-gray-700 opacity-70"></div>
                </div>
              )}

            {/* Milestones */}
            {jobAssignments?.map((assignment) => {
                const canViewMilestones =
                  user?.role === "client" ||
                  (user?.role === "freelancer" &&
                    assignment.freelancer.id === user.id);

                if (!canViewMilestones) return null;

              return (
                <div key={assignment.id} className="mb-10">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Milestones for <span className="text-indigo-600 dark:text-indigo-500">{assignment.freelancer.name}</span>
                  </h2>
                  <MilestoneForm
                    assignmentId={assignment.id}
                    initialMilestones={assignment.milestones || []}
                    user={user as User}
                    setJobAssignments={setJobAssignments}
                    freelancerId={assignment.freelancer.id}
                    jobStatus={job.status}
                  />
                </div>
              )
            })}

            {/* Place Bid */}
            {user?.role === "freelancer" && job.status === "open" && (
              <div className="mt-8">
                <PlaceBidPage
                  user={user}
                  jobId={job.id}
                  isProfileComplete={user.isProfileComplete}
                />
              </div>
            )}

            <div className="my-8 border-t border-gray-200 dark:border-gray-700 opacity-70"></div>

            {/* Start Job Button */}
            {isJobOwner && job.status === "open" && canStartJob && (
              <Button
                label="Start Job"
                onClick={() => handleStartJob()}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
              />
            )}

            {/* Clarification Board */}
            <div className="mt-10">
              <ClarificationBoard jobId={job.id} />
            </div>
          </div>
        )}

        {/* Proposals Section */}
        <ProposalsSection
          activeTab={activeTab}
          jobStatus={job.status}
          userRole={user?.role}
          proposals={proposals}
          proposalsLoading={proposalsLoading}
          proposalFilter={proposalFilter}
          setProposalFilter={setProposalFilter}
          getCardProps={getCardProps}
        />

        {/* Invitations Section */}
        <InvitationsSection
          activeTab={activeTab}
          jobStatus={job.status}
          invitations={invitations}
          invitationsLoading={invitationsLoading}
          isJobOwner={isJobOwner}
          onViewInvitation={(id) => console.log("View invitation", id)}
          onCancelInvitation={(id) => console.log("Cancel invitation", id)}
        />
      </div>
    </section>
  );
};

export default JobDetailPage;