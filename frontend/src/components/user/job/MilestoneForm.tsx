import React, { useEffect, useState } from "react";
import InputSection from "../../ui/InputSection";
import TextAreaSection from "../../ui/TextAreaSection";
import Button from "../../ui/Button";
import type { MilestoneDto } from "../../../types/job/assignment.type";
import { jobAssignmentService } from "../../../services/jobAssignments.service";
import SubmitModal from "./SubmitModal";
import ConfirmationModal from "../../ui/Modal/ConfirmationModal";
import type { User } from "../../../features/authSlice";
import UserModal from "../../ui/Modal/UserModal";
import { useMilestoneActions } from "../../../hooks/useMilestoneActions";
import MilestoneCard from "./Milestones/MilestoneCard";
import StripePaymentModal from "../../ui/Modal/StripeMilestoneModal";

interface MilestoneFormProps {
  assignmentId: string;
  initialMilestones?: MilestoneDto[];
  user: User;
  setJobAssignments: React.Dispatch<React.SetStateAction<any[]>>;
  freelancerId: string;
  jobStatus: string;
  refetchAssignment: () => void
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  assignmentId,
  initialMilestones = [],
  user,
  setJobAssignments,
  freelancerId,
  jobStatus,
  refetchAssignment,
}) => {
  const [milestones, setMilestones] = useState<MilestoneDto[]>(initialMilestones);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    { title?: string; amount?: string; dueDate?: string; description?: string }[]
  >([]);
  // for confirmation modal 
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");

  const [isDisputeModalOpen, setIsDisputeModalOpen] = React.useState(false);

  const [disputeForm, setDisputeForm] = React.useState({ reason: "" });
  const [disputeErrors, setDisputeErrors] = React.useState<{ reason?: string }>({});
  // for stripe
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [isStripeOpen, setIsStripeOpen] = useState(false);

    const {
    addMilestones,
    editMilestone,
    cancelMilestone,
    fundMilestone,
    submitMilestone,
    approveMilestone,
    requestChangeMilestone,
    submitDispute,
  } = useMilestoneActions(assignmentId, setJobAssignments, user);



  const handleDisputeChange = (field: "reason", value: string) => {
    setDisputeForm(prev => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  const validateMilestone = (m: MilestoneDto) => {
    const milestoneErrors: { title?: string; amount?: string; dueDate?: string; description?: string } = {};

    if (!m.title.trim()) milestoneErrors.title = "Title is required";
    if (!m.amount || m.amount <= 0) milestoneErrors.amount = "Amount must be greater than 0";
    if (!m.dueDate) milestoneErrors.dueDate = "Due date is required";
    if (!m.description.trim()) milestoneErrors.description = "Description is required";

    return milestoneErrors;
  };

  const handleAddMilestoneUI = () => {
    setMilestones(prev => [...prev, { title: "", amount: 0, description: "", dueDate: "", status: "draft" }]);
    setEditingIndex(milestones.length);
  };

  const handleFileClick = async (fileKey: string, milestoneId: string) => {
    const response = await jobAssignmentService.getFileUrl(assignmentId, milestoneId, fileKey);
    if (response.data.success) {
      const { url } = response.data;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleFundMilestone = async (milestoneId: string) => {
      const { clientSecret } = await fundMilestone(milestoneId);
  
      setStripeClientSecret(clientSecret);
      setIsStripeOpen(true);
  }


  const handleMilestoneChange = <K extends keyof MilestoneDto>(
    index: number,
    field: K,
    value: string
  ) => {
    const updated = [...milestones];
    
    const parsed =
    typeof updated[index][field] === "number"
    ? (Number(value) as MilestoneDto[K])
        : (value as MilestoneDto[K]);

        updated[index][field] = parsed;
        
    setMilestones(updated);
  };

  const handleCancelLocal = (index: number) => {
    const current = milestones[index];

    if (!current.id) {
      const copy = [...milestones];
      copy.splice(index, 1);
      setMilestones(copy);
      setEditingIndex(null);
      return;
    }

    cancelMilestone(current.id);
    setEditingIndex(null);
  };

  const firstDraftIndex = milestones.findIndex(m => m.status === "draft");
  const hasFunded = milestones.some(m => m.status === "funded");

  return (
    <div className="mb-8">
      <h2 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-2">
        <i className="fa-solid fa-flag-checkered"></i>
        Milestones
      </h2>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        onConfirm={() => {
          confirmAction();
          setIsConfirmOpen(false);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {milestones.map((milestone, index) => (
        <div key={index} className="mb-4">
          {editingIndex === index ? (
            <div className="relative mb-4 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200">
              <button
                type="button"
                onClick={() => handleCancelLocal(index)}
                className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <InputSection
                  name="title"
                  value={milestone.title}
                  onChange={(val: string) => handleMilestoneChange(index, "title", val)}
                  label="Title"
                  placeholder="Add Title"
                  error={errors[index]?.title}
                />
                <InputSection
                  name="amount"
                  type="number"
                  value={String(milestone.amount)}
                  onChange={(val: string) => handleMilestoneChange(index, "amount", val)}
                  label="Amount (INR)"
                  error={errors[index]?.amount}
                />
                <InputSection
                  name="dueDate"
                  type="date"
                  value={milestone.dueDate || ""}
                  onChange={(val: string) => handleMilestoneChange(index, "dueDate", val)}
                  label="Due Date"
                  error={errors[index]?.dueDate}
                />
              </div>

              <TextAreaSection
                name="description"
                value={milestone.description || ""}
                onChange={(val: string) => handleMilestoneChange(index, "description", val)}
                label="Description"
                placeholder="Describe milestone..."
                error={errors[index]?.description}
              />

              <div className="flex gap-4 mt-6">
                <Button
                  label="Save"
                  onClick={() => {
                    const current = milestones[index];
                    const milestoneErrors = validateMilestone(current);
                    const newErrors = [...errors];
                    newErrors[index] = milestoneErrors;
                    setErrors(newErrors);

                    if (Object.keys(milestoneErrors).length > 0) return;
                    if (current.id) {
                      editMilestone(current.id, current);
                    } else {
                      addMilestones([current]);
                    }
                    setEditingIndex(null);
                  }}
                  variant="primary"
                />
                <Button
                  label="Cancel"
                  onClick={() => handleCancelLocal(index)}
                  variant="secondary"
                />
              </div>
            </div>
          ) : (
            <MilestoneCard
              key={milestone.id || index}
              milestone={milestone}
              index={index}
              user={user}
              freelancerId={freelancerId}
              hasFunded={hasFunded}
              firstDraftIndex={firstDraftIndex}
              jobStatus={jobStatus}
              onEdit={(i) => setEditingIndex(i)}
              onCancel={(id) => {
                setConfirmTitle("Cancel Milestone");
                setConfirmDescription("Are you sure you want to cancel this milestone?");
                setConfirmAction(() => () => cancelMilestone(id));
                setIsConfirmOpen(true);
              }}
              onFund={(id) => handleFundMilestone(id)}
              onRequestChange={(id) => requestChangeMilestone(id)}
              onApprove={(id) => {
                setConfirmTitle("Approve Milestone");
                setConfirmDescription("Do you want to approve this submitted milestone?");
                setConfirmAction(() => () => approveMilestone(id));
                setIsConfirmOpen(true);
              }}
              onSubmit={(id) => {
                setSelectedMilestoneId(id);
                setIsSubmitModalOpen(true);
              }}
              onRaiseDispute={(id) => {
                setSelectedMilestoneId(id);
                setIsDisputeModalOpen(true);
              }}
              handleFileClick={handleFileClick}
            />
          )}
          {/* Stripe Payment Modal */}
          <StripePaymentModal
            clientSecret={stripeClientSecret ?? ''}
            isOpen={isStripeOpen}
            onClose={() => setIsStripeOpen(false)}
            onSuccess={() => {
              setIsStripeOpen(false);
              setTimeout(() => {
                refetchAssignment();
              }, 1500);
            }}
          />
          {/* Milestone Submission Modal */}
          <SubmitModal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            onSubmit={(note, files) => {
              if (selectedMilestoneId) {
                submitMilestone(selectedMilestoneId, note, files);
              }
            }}
          />
        </div>
      ))}

      <UserModal
        isOpen={isDisputeModalOpen}
        onClose={() => {
          setIsDisputeModalOpen(false);
          setDisputeForm({ reason: "" });
          setDisputeErrors({});
        }}
        onSubmit={() => submitDispute(
          selectedMilestoneId!,
          disputeForm,
          setDisputeErrors,
          setDisputeForm,
          setIsDisputeModalOpen
        )}
        formData={disputeForm}
        onChange={handleDisputeChange}
        title="Raise Dispute"
        textAreas={[
          { name: "reason", label: "Dispute Reason", placeholder: "Enter reason for dispute", rows: 4 },
        ]}
        errors={disputeErrors}
      />

      {user?.role === "client" && (jobStatus === "open" || jobStatus === "active") &&  (
        <button
          onClick={handleAddMilestoneUI}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-6 flex items-center gap-1"
        >
          <i className="fa-solid fa-plus"></i> Add Milestone
        </button>
      )}
    </div>
  );
};

export default MilestoneForm;
