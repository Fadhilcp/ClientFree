import React from "react";
import { type IProposal } from "../../../types/job/proposal.type";
import UserInfo from "../../user/UserInfo";
import Button from "../Button";
import { useNavigate } from "react-router-dom";

interface ProposalDetailModalProps {
  proposal: IProposal | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({ proposal, isOpen, onClose }) => {
  if (!isOpen || !proposal) return null;

  const navigate = useNavigate();

  const showFreelancerProfile = (freelancerId: string) => {
    navigate(`/users/${freelancerId}`);
  };

return (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
    <div className="no-scrollbar bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Proposal Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Freelancer Info */}
      <div className="mb-6 flex items-center justify-between">
        <UserInfo
          username={proposal.freelancer.username}
          email={proposal.freelancer.email}
          profileImage={proposal.freelancer.profileImage}
          size={48}
          isVerified={proposal.freelancer.isVerified}
        />

        {/* View Profile button */}
        <button
          onClick={() => showFreelancerProfile(proposal.freelancer.id)}
          className="px-4 py-2 text-xs font-semibold rounded-md 
                    dark:bg-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700
                    hover:dark:bg-indigo-600 transition shadow"
        >
          View Profile 
        </button>
      </div>

      {/* Job Info */}
      {proposal.job && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            {proposal.job.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-gray-100">Category:</span>{" "}
            {proposal.job.category} / {proposal.job.subcategory}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-gray-100">Status:</span>{" "}
            {proposal.job.status}
          </p>
        </div>
      )}

      {/* Proposal Details */}
      <div className="space-y-4 mb-6">
        <div>
          <span className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Bid Amount
          </span>
          <p className="text-sm text-gray-800 dark:text-gray-200">₹{proposal.bidAmount}</p>
        </div>
        <div>
          <span className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Duration
          </span>
          <p className="text-sm text-gray-800 dark:text-gray-200">{proposal.duration}</p>
        </div>
        <div>
          <span className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Description
          </span>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {proposal.description}
          </p>
        </div>
      </div>
      {/* Milestones */}
      {proposal.milestones && proposal.milestones.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Milestones
          </h4>
          <ul className="space-y-3">
            {proposal.milestones.map((m, idx) => (
              <li
                key={idx}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">{m.title}</div>
                <p className="text-gray-700 dark:text-gray-300">Amount: ₹{m.amount}</p>
                {m.dueDate && (
                  <p className="text-gray-700 dark:text-gray-300">
                    Due: {new Date(m.dueDate).toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end">
        <Button onClick={onClose} label="Close" />
      </div>
    </div>
  </div>
);
};

export default ProposalDetailModal;