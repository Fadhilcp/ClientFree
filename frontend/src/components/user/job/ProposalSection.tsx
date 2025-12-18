import React from "react";
import Card from "../../ui/Card/Card";
import DropdownSection from "../../ui/DropdownSection";
import type { IProposal } from "../../../types/job/proposal.type";

interface ProposalsSectionProps {
  activeTab: string;
  jobStatus: string;
  userRole?: "freelancer" | "client" | "admin";
  proposals: IProposal[];
  proposalsLoading: boolean;
  proposalFilter: string;
  setProposalFilter: (val: string) => void;
  getCardProps: (proposal: IProposal) => any;
}

const ProposalsSection: React.FC<ProposalsSectionProps> = ({
  activeTab,
  jobStatus,
  userRole,
  proposals,
  proposalsLoading,
  proposalFilter,
  setProposalFilter,
  getCardProps,
}) => {

  if (activeTab !== "proposals") return null;

  // freelancer view when job is active
  if (userRole === "freelancer" && jobStatus === "active") {
    return (
      <p className="p-6 text-gray-600 dark:text-gray-300">
        This job is no longer accepting proposals. You were not selected.
      </p>
    );
  }

  if (userRole === "client" && jobStatus === "active") {
    return (
      <p className="p-6 text-gray-600 dark:text-gray-300">
        Proposals are hidden after the job becomes active.
      </p>
    );
  }

  if (jobStatus === "open") {
    return (
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
    );
  }

  return null;
};

export default ProposalsSection;