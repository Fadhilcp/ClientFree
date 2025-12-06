import React, { useEffect, useState } from "react";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { proposalService } from "../../../services/proposal.service";
import type { IProposal } from "../../../types/job/proposal.type";

const ProposalAndInvitation: React.FC = () => {
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInvitation, setIsInvitation] = useState(false);
  const navigate = useNavigate();

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await proposalService.proposalsForClient(isInvitation);
      console.log("🚀 ~ fetchProposals ~ response:", response)
      if (response.data.success) {
        const { proposals } = response.data;
        setProposals(proposals);
      }
    } catch (err) {
      console.error("Failed to load proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [isInvitation]);

  const handleSearch = (query: string) => {
    console.log("Searching jobs for:", query);
  };

  const handleViewDetails = (jobId: string) => {
    navigate(`/job-details/${jobId}`);
  };

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      {loading && <Loader />}
      <div className="container mx-auto">
        {/* Title + Search + Dropdown aligned */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
            {isInvitation ? "Invitations" : "Proposals"}
          </h2>

          <div className="flex items-center gap-4">
            {/* Dropdown toggle */}
            <select
              value={isInvitation ? "invitations" : "proposals"}
              onChange={(e) => setIsInvitation(e.target.value === "invitations")}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-700 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="proposals">Proposals</option>
              <option value="invitations">Invitations</option>
            </select>

            <SearchBar
              placeholder={isInvitation ? "Search invitations..." : "Search jobs..."}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Empty State */}
        {(!proposals || proposals.length === 0) && (
          <p className="text-gray-500 text-center py-10">
            {isInvitation ? "No invitations found." : "No proposals found."}
          </p>
        )}

        {/* Proposal Cards */}
        {proposals &&
          proposals.length > 0 &&
          proposals.map((proposal) => (
            <Card
              key={proposal.id}
              title={proposal.invitation?.title || proposal.job?.title || `Job #${proposal.job?.id}`}
              subtitle={
                isInvitation
                  ? `Invitation from ${proposal.invitedBy ?? "Client"}`
                  : `Bid: ₹${proposal.bidAmount}`
              }
              meta={[
                { label: "Duration", value: proposal.duration || "N/A" },
                { label: "Status", value: proposal.status },
                {
                  label: "Created",
                  value: new Date(proposal.createdAt).toLocaleDateString(),
                },
              ]}
              description={
                isInvitation
                  ? proposal.invitation?.message || "No message provided."
                  : proposal.description
              }
              actions={[
                {
                  label: "View Details",
                  onClick: () => handleViewDetails(proposal.job?.id!),
                  variant: "primary",
                },
                !isInvitation
                  ? {
                      label: "Edit Proposal",
                      onClick: () => console.log("Edit proposal", proposal.id),
                      variant: "secondary",
                    }
                  : null,
              ].filter(Boolean) as ActionItem[]}
            />
          ))}
      </div>
    </section>
  );
};

export default ProposalAndInvitation;