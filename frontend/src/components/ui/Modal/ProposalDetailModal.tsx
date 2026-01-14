import React from "react";
import { type IProposal } from "../../../types/job/proposal.type";
import UserInfo from "../../user/UserInfo";
import Button from "../Button";

interface ProposalDetailModalProps {
  proposal: IProposal | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({ proposal, isOpen, onClose }) => {
  if (!isOpen || !proposal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Proposal Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>

        {/* Freelancer Info */}
        <div className="mb-5">
            <UserInfo
                username={proposal.freelancer.username}
                email={proposal.freelancer.email}
                profileImage={proposal.freelancer.profileImage}
                size={48}
                isVerified={proposal.freelancer.isVerified}
            />
        </div>

        {/* Job Info */}
        {proposal.job && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{proposal.job.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{proposal.job.category} / {proposal.job.subcategory}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Status: {proposal.job.status}</p>
          </div>
        )}

        {/* Proposal Details */}
        <div className="space-y-3 mb-6">
          <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Bid Amount:</span> ₹{proposal.bidAmount}</p>
          <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Duration:</span> {proposal.duration}</p>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line"><span className="font-medium">Description:</span> {proposal.description}</p>
        </div>

        {/* Milestones */}
        {proposal.milestones && proposal.milestones.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Milestones</h4>
            <ul className="space-y-2">
              {proposal.milestones.map((m, idx) => (
                <li key={idx} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-medium">{m.title}</div>
                  <div>Amount: ₹{m.amount}</div>
                  {m.dueDate && <div>Due: {new Date(m.dueDate).toLocaleDateString()}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end">
            <Button
                onClick={onClose}
                label="Close" 
            />
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailModal;