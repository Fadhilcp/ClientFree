import React, { useEffect, useState } from "react";
import Card from "../../ui/Card/Card";
import type { IProposal } from "../../../types/job/proposal.type";
import { proposalService } from "../../../services/proposal.service";
import { notify } from "../../../utils/toastService";
import Pagination from "../Pagination";

interface InvitationsSectionProps {
  jobId: string;
  jobStatus: string;
  // isJobOwner: boolean;
}

const LIMIT = 1;

const InvitationsSection: React.FC<InvitationsSectionProps> = ({
  jobId,
  jobStatus,
  // isJobOwner,
}) => {

  const [invitations, setInvitations] = useState<IProposal[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!jobId) return;

    // for proposal and invitation 
    const fetchData = async () => {
      try {
          setInvitationsLoading(true);
          const res = await proposalService.getProposalsForJob(
            jobId, 
            "", 
            true,
            page,
            LIMIT
          );

          if (res.data.success) {
            const { proposals, total, totalPages } = res.data;
            setInvitations(proposals);
            setTotal(total);
            setTotalPages(totalPages);
          }

      } catch (err) {
        notify.error('Pleaes try again!')
        console.error("Failed:", err);
      } finally {
        setInvitationsLoading(false);
      }
    };

    fetchData();
  }, [jobId, jobStatus, page]);

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
              isVerified={p.freelancer.isVerified}
              title={p.invitation.title || "Invitation"}
              description={p.invitation.message || "This freelancer was invited to bid."}
              status={p.status}
              footer={`Invited on: ${new Date(p.createdAt).toLocaleDateString()}`}
            />
          ))}
        </div>

        
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No invitations yet.</p>
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        entityLabel="invitations"
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default InvitationsSection;