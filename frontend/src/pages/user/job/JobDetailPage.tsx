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
import DropdownSection from "../../../components/ui/DropdownSection";
import { notify } from "../../../utils/toastService";
import type { SkillItem } from "../../../types/skill.types";
import CenteredMessage from "../../../components/user/CenteredMessage";
import Button from "../../../components/ui/Button";
import { jobAssignmentService } from "../../../services/jobAssignments.service";
import MilestoneForm from "../../../components/user/job/MilestoneForm";
import type { AssignmentDto, MilestoneDto } from "../../../types/job/assignment.type";

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
  console.log("🚀 ~ JobDetailPage ~ job:", job)
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalFilter, setProposalFilter] = useState("all");
  const [invitations, setInvitations] = useState<IProposal[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  
  const [jobAssignments, setJobAssignments] = useState<AssignmentDto[]>([]);
  console.log("🚀 ~ JobDetailPage ~ jobAssignments:", jobAssignments)
  // to find the user who post job
  const isJobOwner = user?.id === job?.clientId;
  
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

  // --- Function to handle milestone update ---
  const handleUpdateMilestones = async (assignmentId: string, milestones: MilestoneDto[]) => {
    try {
      const res = await jobAssignmentService.updateMilestones(assignmentId, milestones);
      if (res.data.success) {
        notify.success("Milestones updated successfully");

        // Update local state
        setJobAssignments((prev) =>
          prev.map((a) =>
            a.id === assignmentId ? { ...a, milestones } : a
          )
        );
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to update milestones");
    }
  }


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
// propos of cards
  const getCardProps = (p: IProposal) => ({
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
    });

    
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
    <section className="bg-white dark:bg-gray-900 min-h-screen flex justify-center py-6">
      <div className="w-full max-w-6xl border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 shadow-sm">
        {/* Top Section */}
        <JobHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          status={job.status}
          onBack={() => navigate(-1)}
        />

        {/* Job Details */}
        {activeTab === "details" && (
          
          <div className="p-6">
            <JobDetails job={job} />
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

            {/* Freelancer not selected notice */}
            {user?.role === "freelancer" &&
              job.status === "active" &&
              !(job.acceptedProposals ?? []).some(p => p.freelancer && p.freelancer.id === user.id) && (
                <div className="p-4 mb-4 text-red-600 dark:text-red-400 font-medium">
                  You were not selected for this job.
                </div>
            )}

            {/* Hired / Accepted Freelancer Section */}
            {isJobOwner && job.acceptedProposals && job.acceptedProposals.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  {job.acceptedProposals.length > 1 ? "Hired Freelancers" : "Hired Freelancer"}
                </h2>
                <div className="space-y-4">
                  {job.acceptedProposals.map((p: any) => (
                    <Card
                      key={p.id}
                      user={p.freelancer ?? undefined}
                      title={p.freelancer.professionalTitle || p.freelancer.name}
                      subtitle={`Bid: ₹${p.bidAmount} • Duration: ${p.duration}`}
                      description={p.description}
                      status={p.status}
                      tags={p.freelancer.skills ? p.freelancer.skills.map((s: SkillItem) => (s.name)) : []}
                      meta={[
                        { label: "Experience", value: p.freelancer.experienceLevel },
                        { label: "Hourly Rate", value: p.freelancer.hourlyRate },
                      ]}
                      footer={`Accepted on: ${new Date(p.updatedAt).toLocaleDateString()}`}
                      actions={[
                        {
                          label: "View Profile",
                          onClick: () => console.log("View freelancer", p.freelancer.id),
                          variant: "secondary" as const,
                        },
                      ]}
                    />
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
              {isJobOwner && jobAssignments?.map((assignment) => (
                <div key={assignment.id} className="mb-8">
                  <h2 className="text-md font-bold text-gray-800 dark:text-gray-100 mb-3">
                    Milestones for {assignment.freelancer.name}
                  </h2>

                  <MilestoneForm
                    initialMilestones={assignment.milestones || []}
                    onSubmit={(milestones) => handleUpdateMilestones(assignment.id, milestones)}
                    submitLabel="Save & Fund Milestones"
                  />
                </div>
              ))}

                
                        {/* Start Job Button */}
                {job.status === "open" && (
                  <Button
                    label="Start Job"
                    onClick={() => handleStartJob()}
                    className="mt-4 px-4 py-2 bg-indigo-600 dark:bg-indigo-600 text-white rounded-md hover:bg-indigo-700 hover:dark:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                )}

              </div>
            )}

            { user?.role === 'freelancer' && job.status === 'open' && (
              <PlaceBidPage jobId={job.id} />
            )}
          </div>
        )}

        {/* Proposals */}
        {activeTab === "proposals" && (
          <>
            {/* hide proposals for freelancers when job is active */}
            {user?.role === "freelancer" && job.status === "active" && (
              <p className="p-6 text-gray-600 dark:text-gray-300">
                This job is no longer accepting proposals. You were not selected.
              </p>
            )}

            {/* hide proposals list when job is active for client too */}
            {user?.role === "client" && job.status === "active" && (
              <p className="p-6 text-gray-600 dark:text-gray-300">
                Proposals are hidden after the job becomes active.
              </p>
            )}

            {/* normal proposals UI list (only when job is open) */}
            {job.status === "open" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Proposals
                  </h2>
                  <div className="w-fit">
                    <DropdownSection<{ filter: string }>
                      name="filter"
                      value={proposalFilter}
                      onChange={(_, val) => setProposalFilter(val)}
                      options={["all", "pending", "shortlisted", "accepted", "rejected"]}
                    />
                  </div>
                </div>

                {proposalsLoading ? (
                  <p className="text-gray-600 dark:text-gray-300">Loading proposals...</p>
                ) : proposals.length > 0 ? (
                  <div className="space-y-4">
                    {proposals.map((p, i) => (
                      <Card key={p.id || i} {...getCardProps(p)} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">No proposals yet.</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Invitations */}
        {activeTab === "invitations" && job.status === "open" && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Invitations
            </h2>
            {invitationsLoading ? (
              <p className="text-gray-600 dark:text-gray-300">Loading invitations...</p>
            ) : invitations.length > 0 ? (
              <div className="space-y-4">
                {invitations.map((p, i) => (
                  <Card
                    key={p.id || i}
                    user={p.freelancer}
                    title="Invitation"
                    description={p.description || "This freelancer was invited to bid."}
                    status={p.status}
                    footer={`Invited on: ${new Date(p.createdAt).toLocaleDateString()}`}
                    actions={[
                      {
                        label: "View",
                        onClick: () => console.log("View invitation", p.id),
                        variant: "secondary" as const,
                      },
                      ...(isJobOwner
                        ? [
                            {
                              label: "Cancel Invitation",
                              onClick: () => console.log("Cancel invitation", p.id),
                              variant: "secondary" as const,
                            },
                          ]
                        : []),
                    ]}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">No invitations yet.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobDetailPage;