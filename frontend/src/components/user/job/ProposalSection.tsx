import React, { useEffect, useState } from "react";
import Card, { type ActionItem } from "../../ui/Card/Card";
import DropdownSection from "../../ui/DropdownSection";
import type { IProposal, ProposalStatus } from "../../../types/job/proposal.type";
import type { User } from "../../../features/authSlice";
import { formatDate } from "../../../utils/formatters";
import { proposalService } from "../../../services/proposal.service";
import { notify } from "../../../utils/toastService";
import { getUpgradeProposal } from "../../../utils/getUpgradeProposal";
import UserModal from "../../ui/Modal/UserModal";
import ConfirmationModal from "../../ui/Modal/ConfirmationModal";
import Pagination from "../Pagination";

interface ProposalsSectionProps {
  jobId: string;
  jobStatus: string;
  isJobOwner: boolean;
  user: User | null;
}

const LIMIT = 1;

const ProposalsSection: React.FC<ProposalsSectionProps> = ({
  jobId,
  jobStatus,
  isJobOwner,
  user
}) => {


  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalFilter, setProposalFilter] = useState("all");

  const [cancelTarget, setCancelTarget] = useState<IProposal | null>(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);


  const [editTarget, setEditTarget] = useState<IProposal | null>(null);
  const [editData, setEditData] = useState({
    bidAmount: "",
    duration: "",
    description: "",
  });


  const openEditModal = (p: IProposal) => {
    setEditTarget(p);
    setEditData({
      bidAmount: String(p.bidAmount),
      duration: p.duration,
      description: p.description,
    });
  };

  const handleEditSubmit = async () => {
    if (!editTarget) return;

    try {
      const res = await proposalService.updateProposal(editTarget.id, {
        bidAmount: Number(editData.bidAmount),
        duration: editData.duration,
        description: editData.description,
      });

      if (res.data.success) {
        notify.success("Proposal updated");

        setProposals(prev =>
          prev.map(p =>
            p.id === editTarget.id ? res.data.proposal : p
          )
        );

        setEditTarget(null);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to update proposal");
    }
  };


  // for proposal 
  const fetchData = async () => {
    try {
        setProposalsLoading(true);
        const res = await proposalService.getProposalsForJob(
          jobId,
          proposalFilter !== "all" ? proposalFilter : "",
          false,
          page,
          LIMIT
        );

        if (res.data.success) {
          const { proposals, total, totalPages } = res.data;
          setProposals(proposals);
          setTotal(total);
          setTotalPages(totalPages);
        };

    } catch (err) {
      notify.error('Pleaes try again!')
      console.error("Failed:", err);
    } finally {
      setProposalsLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    if (jobStatus === "active") {
      setProposals([]);
      return; 
    }

  fetchData();
  }, [jobId, proposalFilter, jobStatus, page]);

  useEffect(() => {
    setPage(1);
  }, [proposalFilter]);    

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
      }
    } catch (error: any) {
      console.error("Failed to update status:", error);
      notify.error(error.response?.data?.error || "Failed to update proposal status");
    }
  }

  const handleCancelProposal = async () => {
    if (!cancelTarget) return;

    try {
      const res = await proposalService.cancelProposal(cancelTarget.id);
      if (res.data.success) {
        notify.success("Proposal withdrawn");

        setProposals(prev =>
          prev.map(p =>
            p.id === cancelTarget.id
              ? { ...p, status: "withdrawn" }
              : p
          )
        );
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to cancel proposal");
    } finally {
      setCancelTarget(null);
    }
  };


  const getProposalActions = (p: IProposal): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: "View",
        onClick: () => console.log("View proposal", p.id),
        variant: "secondary" as const,
      },
    ];

  const isFreelancerOwner =
    user?.role === "freelancer" &&
    p.freelancer?.id === user.id;

  const canEdit =
    isFreelancerOwner &&
    jobStatus === "open" &&
    p.status === "pending";

  const canCancel =
    isFreelancerOwner &&
    jobStatus === "open" &&
    ["pending", "shortlisted"].includes(p.status);

    
    
    if (canEdit) {
      actions.push({
        label: "Edit",
        onClick: () => openEditModal(p),
        variant: "secondary",
      });
    }
    
    if (canCancel) {
      actions.push({
        label: "Withdraw",
        onClick: () => setCancelTarget(p),
        variant: "secondary",
      });
    }
    if (!isJobOwner) return actions;

    
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
  }
  
  return actions;
  };

  const getCardProps = (p: IProposal) => {
    const upgradeProps = getUpgradeProposal({
      proposal: p,
      userId: user?.id,
      isJobOwner,
    });
      
      return {
      user: p.freelancer ?? undefined,
      isVerified: p.freelancer.isVerified,
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

  // freelancer view when job is active
  if (user?.role === "freelancer" && jobStatus === "active") {
    return (
      <p className="p-6 text-gray-600 dark:text-gray-300">
        This job is no longer accepting proposals. You were not selected.
      </p>
    );
  }

  if (user?.role === "client" && jobStatus === "active") {
    return (
      <p className="p-6 text-gray-600 dark:text-gray-300">
        Proposals are hidden after the job becomes active.
      </p>
    );
  }

  if (jobStatus === "open") {
    return (
      <div className="p-6">

        {cancelTarget && (
          <ConfirmationModal
          isOpen={true}
          title="Withdraw Proposal"
          description="Are you sure you want to withdraw this proposal?"
          onCancel={() => setCancelTarget(null)}
          onConfirm={handleCancelProposal}/>
        )}

        {editTarget && (
          <UserModal
            isOpen={true}
            onClose={() => setEditTarget(null)}
            onSubmit={handleEditSubmit}
            formData={editData}
            onChange={(field, value) =>
              setEditData(prev => ({ ...prev, [field]: value }))
            }
            title="Edit Proposal"
            fields={[
              { name: "bidAmount", label: "Bid Amount", type: "number" },
              { name: "duration", label: "Duration" },
            ]}
            textAreas={[
              { name: "description", label: "Description" },
            ]}
          />
        )}


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

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          entityLabel="proposals"
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    );
  }

  return null;
};

export default ProposalsSection;