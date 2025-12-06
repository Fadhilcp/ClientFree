import React from "react";
import Card from "../../ui/Card/Card";
import type { IProposal } from "../../../types/job/proposal.type";

interface InvitationsSectionProps {
  activeTab: string;
  jobStatus: string;
  invitations: IProposal[];
  invitationsLoading: boolean;
  isJobOwner: boolean;
  onViewInvitation?: (invitationId: string) => void;
  onCancelInvitation?: (invitationId: string) => void;
}

const InvitationsSection: React.FC<InvitationsSectionProps> = ({
  activeTab,
  jobStatus,
  invitations,
  invitationsLoading,
  onViewInvitation,
}) => {
  if (activeTab !== "invitations" || jobStatus !== "open") return null;

  return (
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
              title={p.invitation.title || "Invitation"}
              description={p.invitation.message || "This freelancer was invited to bid."}
              status={p.status}
              footer={`Invited on: ${new Date(p.createdAt).toLocaleDateString()}`}
              actions={[
                {
                  label: "View",
                  onClick: () => onViewInvitation?.(p.id),
                  variant: "secondary" as const,
                },
              ]}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No invitations yet.</p>
      )}
    </div>
  );
};

export default InvitationsSection;