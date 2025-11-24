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
  // to find the user who post job
  const isJobOwner = user?.id === job?.clientId;

  useEffect(() => {
  if (!id) return;

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
      console.error("Failed:", err);
      setProposalsLoading(false);
      setInvitationsLoading(false);
    }
  };

  fetchData();
}, [id, activeTab, proposalFilter]);

  // polling of new proposal( every 20 seconds )
  useEffect(() => {
    if (!id || activeTab !== "proposals") return;
    console.log('hello')
    const interval = setInterval(async () => {
      try {
        const response = await proposalService.getProposalsForJob(
          id,
          proposalFilter !== "all" ? proposalFilter : "",
          false
        );
        console.log('hello')
        if (response.data.success) setProposals(response.data.proposals);
      } catch (err) {
        console.error("Polling failed:", err);
      }
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [id, activeTab, proposalFilter]);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await jobService.getJob(id);
        if (res.data.success) {
          setJob(res.data.job);
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChangeStatus = async(proposalId: string, status: ProposalStatus) => {
    try { 
      const response = await proposalService.updateProposalStatus(proposalId, status);
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
    } catch (error) {
      console.error("Failed to update status:", error);
      notify.error("Failed to update proposal status");
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
      user: p.freelancer,
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
            <PlaceBidPage jobId={job.id} />
          </div>
        )}

        {/* Proposals */}
        {activeTab === "proposals" && (
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

        {/* Invitations */}
        {activeTab === "invitations" && (
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