import React, { useEffect, useState } from "react";
import Card, { type ActionItem } from "../../ui/Card/Card";
import type { IProposal } from "../../../types/job/proposal.type";
import { proposalService } from "../../../services/proposal.service";
import { notify } from "../../../utils/toastService";
import Pagination from "../Pagination";
import ConfirmationModal from "../../ui/Modal/ConfirmationModal";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

interface InvitationsSectionProps {
  jobId: string;
  jobStatus: string;
  isJobOwner: boolean;
}

const LIMIT = 10;

const InvitationsSection: React.FC<InvitationsSectionProps> = ({
  jobId,
  jobStatus,
  isJobOwner,
}) => {

  const [invitations, setInvitations] = useState<IProposal[]>([]);
  const [withdrawTarget, setWithdrawTarget] = useState<IProposal | null>(null);

  const [invitationsLoading, setInvitationsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  
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
    } finally {
      setInvitationsLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    fetchData();
  }, [jobId, jobStatus, page]);

  const handleWithdrawInvitation = async () => {
    if (!withdrawTarget) return;

    try {
      const res = await proposalService.withdrawInvitation(withdrawTarget.id);

      if (res.data.success) {
        notify.success("Invitation withdrawn");

        await fetchData();
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to withdraw invitation");
    } finally {
      setWithdrawTarget(null);
    }
  };

  const handleAcceptInvitation = async (proposal: IProposal) => {
    try {
      if(!proposal.job?.id) return;
      
      const res = await proposalService.acceptInvitation(
        proposal.job?.id,
        proposal.freelancer.id
      );

      if (res.data.success) {
        notify.success(res.data.message || "Invitation accepted");
        await fetchData();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.error || "Failed to accept invitation"
      );
    }
  };


  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Invitations
      </h2>

      {withdrawTarget && (
        <ConfirmationModal
          isOpen={true}
          title="Withdraw Invitation"
          description="Are you sure you want to withdraw this invitation?"
          onCancel={() => setWithdrawTarget(null)}
          onConfirm={handleWithdrawInvitation}
        />
      )}

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
              actions={[
                isJobOwner &&
                jobStatus === "open" &&
                p.isInvitation &&
                p.status === "invited" ?
                      {
                        label: "Withdraw",
                        variant: "secondary",
                        onClick: () => setWithdrawTarget(p),
                      } : null,
                    user?.id === p.freelancer.id &&  {
                        label: "Accept",
                        variant: "primary",
                        onClick: () => handleAcceptInvitation(p),
                      },
                ].filter(Boolean) as ActionItem[]
              } 
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