import React from "react";
import Card from "../../../ui/Card/Card";
import type { ActionItem } from "../../../ui/Card/Card";
import type { MilestoneDto } from "../../../../types/job/assignment.type";

interface MilestoneCardProps {
  milestone: MilestoneDto;
  index: number;
  user: any;
  freelancerId: string;
  hasFunded: boolean;
  firstDraftIndex: number;
  onEdit: (index: number) => void;
  onCancel: (id: string) => void;
  onFund: (id: string, amount: number) => void;
  onRequestChange: (id: string) => void;
  onApprove: (id: string) => void;
  onSubmit: (id: string) => void;
  onRaiseDispute: (id: string) => void;
  handleFileClick: (fileKey: string, milestoneId: string) => void;
  jobStatus: string;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  index,
  user,
  freelancerId,
  hasFunded,
  firstDraftIndex,
  onEdit,
  onCancel,
  onFund,
  onRequestChange,
  onApprove,
  onSubmit,
  onRaiseDispute,
  handleFileClick,
  jobStatus,
}) => {
  const meta = [
    { label: "Amount", value: `₹ ${milestone.amount}` },
    {
      label: "Due Date",
      value: milestone.dueDate
        ? new Date(milestone.dueDate).toLocaleDateString()
        : "N/A",
    },
    milestone.submissionMessage
      ? { label: "Submission Message", value: milestone.submissionMessage }
      : null,
    milestone.submittedAt
      ? {
          label: "Submitted At",
          value: new Date(milestone.submittedAt).toLocaleString(),
        }
      : null,
  ].filter((m): m is { label: string; value: string } => m !== null);
  // button actions
  const actions: ActionItem[] = [
    user?.role === "client" && milestone.status === "draft"
      ? { label: "Edit", onClick: () => onEdit(index), variant: "secondary" }
      : null,

    user?.role === "client" && milestone.id && milestone.status === "draft"
      ? { label: "Cancel", onClick: () => onCancel(milestone.id!), variant: "secondary" }
      : null,

    user?.role === "client" &&
    !hasFunded && milestone.id && milestone.status === "draft" && index === firstDraftIndex
      ? { label: "Fund", onClick: () => onFund(milestone.id!, milestone.amount), variant: "primary" }
      : null,

    user?.role === "client" && milestone.status === "submitted"
      ? { label: "Request Change", onClick: () => onRequestChange(milestone.id!), variant: "secondary" }
      : null,

    user?.role === "client" && jobStatus === "active" && milestone.status === "submitted"
      ? { label: "Approve", onClick: () => onApprove(milestone.id!), variant: "primary" }
      : null,

    user?.role === "freelancer" && jobStatus === "active" && 
    (milestone.status === "funded" || milestone.status === "changes_requested") &&
    freelancerId === user.id
      ? { label: "Submit", onClick: () => onSubmit(milestone.id!), variant: "primary" }
      : null,

    user?.role === "client" && milestone.status === "submitted" && jobStatus === "active"
      ? { label: "Raise Dispute", onClick: () => onRaiseDispute(milestone.id!), variant: "danger" }
      : null,

    user?.role === "freelancer" && jobStatus === "active" &&
    milestone.status === "changes_requested" &&
    freelancerId === user.id
      ? { label: "Raise Dispute", onClick: () => onRaiseDispute(milestone.id!), variant: "secondary" }
      : null,
      
  ].filter(Boolean) as ActionItem[];

  return (
    <Card
      title={milestone.title || "Untitled Milestone"}
      description={milestone.description}
      meta={meta}
      status={milestone.status || "pending"}
      extraContent={
        milestone.submissionFiles?.length ? (
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
              Submission Files
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
              {milestone.submissionFiles.map((file) => (
                <li key={file.key}>
                  <button
                    type="button"
                    onClick={() => handleFileClick(file.key, milestone.id!)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Download File ({file.type})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      }
      actions={actions}
    />
  );
};

export default MilestoneCard;