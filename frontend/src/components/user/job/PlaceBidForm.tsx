import React, { useState } from "react";
import InputSection from "../../ui/InputSection";
import TextAreaSection from "../../ui/TextAreaSection";
import Button from "../../ui/Button";
import { proposalService } from "../../../services/proposal.service";
import { notify } from "../../../utils/toastService";
import type { IProposal, IProposalForm } from "../../../types/job/proposal.type";
import type { Milestone } from "../../../types/job/assignment.type";

interface PlaceBidPageProps {
  jobId: string;
  isProfileComplete: boolean;
}

const PlaceBidPage: React.FC<PlaceBidPageProps> = ({ jobId, isProfileComplete }) => {
  const [proposalState, setProposalState] = useState<IProposalForm>({
    jobId,
    bidAmount: 0,
    duration: "",
    description: "",
    milestones: [],
    optionalUpgrades: [],
  });

  const [errors, setErrors] = useState<{
    bidAmount?: string;
    duration?: string;
    description?: string;
    milestones?: { title?: string; amount?: string; dueDate?: string; description?: string }[];
  }>({});

  const validateProposal = (): boolean => {
    const newErrors: typeof errors = { milestones: [] };

    if (!proposalState.bidAmount || proposalState.bidAmount <= 0) {
      newErrors.bidAmount = "Bid amount must be greater than 0";
    }
    if (!proposalState.duration.trim()) {
      newErrors.duration = "Duration is required";
    }
    if (!proposalState.description.trim()) {
      newErrors.description = "Proposal description is required";
    }

    // Validate milestones if any
    proposalState.milestones.forEach((m, i) => {
      const milestoneErrors: { title?: string; amount?: string; dueDate?: string; description?: string } = {};
      if (!m.title.trim()) milestoneErrors.title = "Title is required";
      if (!m.amount || m.amount <= 0) milestoneErrors.amount = "Amount must be greater than 0";
      if (!m.dueDate) milestoneErrors.dueDate = "Due date is required";
      if (!m.description?.trim()) milestoneErrors.description = "Description is required";
      newErrors.milestones![i] = milestoneErrors;
    });

    setErrors(newErrors);

    // return true only if no errors
    return !(
      newErrors.bidAmount ||
      newErrors.duration ||
      newErrors.description ||
      newErrors.milestones?.some(
        (m) => m.title || m.amount || m.dueDate || m.description
      )
    );
  };

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof IProposal, value: string | number) => {
    setProposalState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddMilestone = () => {
    setProposalState((prev) => ({
      ...prev,
      milestones: [
        ...(prev.milestones || []),
        { title: "", amount: 0, description: "", dueDate: "" },
      ],
    }));
  };

  const handleMilestoneChange = (
    index: number,
    field: "title" | "amount" | "description" | "dueDate",
    value: string
  ) => {
    const updated = [...(proposalState.milestones || [])];
    if (field === "amount") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setProposalState((prev) => ({ ...prev, milestones: updated }));
  };

  const handleRemoveMilestone = (index: number) => {
    const updated = [...(proposalState.milestones || [])];
    updated.splice(index, 1);
    setProposalState((prev) => ({ ...prev, milestones: updated }));
  };

  const handleSubmit = async () => {
    if(!isProfileComplete){
      notify.info('Before place bid, please complete you profile');
      return;
    }
    if (!validateProposal()) return;
    try {
      setLoading(true);

      const payload: IProposalForm = {
        ...proposalState,
        bidAmount: Number(proposalState.bidAmount),
        milestones: (proposalState.milestones || []).map((m) => ({
          ...m,
          amount: Number(m.amount),
          dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined,
        })),
      };

      const res = await proposalService.createProposal(payload);

      if (res.data.success) {
        notify.success("Bid placed successfully!");
        // reset form
        setProposalState({
          jobId,
          bidAmount: 0,
          duration: "",
          description: "",
          milestones: [],
          optionalUpgrades: [],
        });
        setErrors({});
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to place bid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white dark:bg-gray-900 p-6 relative pb-20">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Place a Bid on this Project
      </h1>

      {/* Bid Amount + Duration side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <InputSection<IProposal>
          name="bidAmount"
          type="number"
          value={String(proposalState.bidAmount)}
          onChange={(val: string) => handleChange("bidAmount", Number(val))}
          placeholder="₹ 56200.00"
          label="Bid Amount (INR)"
          error={errors.bidAmount}
        />
        <InputSection<IProposal>
          name="duration"
          type="text"
          value={proposalState.duration}
          onChange={(val: string) => handleChange("duration", val)}
          placeholder="e.g. 7 Days"
          label="Duration"
          error={errors.duration}
        />
      </div>

      {/* Proposal Description */}
      <div className="mb-6">
        <TextAreaSection<IProposal>
          name="description"
          value={proposalState.description}
          onChange={(val: string) => handleChange("description", val)}
          placeholder="What makes you the best candidate for this project?"
          label="Describe Your Proposal"
          rows={5}
          error={errors.description}
        />
      </div>

      {/* Milestone Payments */}
      <div className="mb-6">
        <h2 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
          Request Milestone Payments
        </h2>
        {proposalState.milestones?.map((milestone, index) => (
          <div
            key={index}
            className="relative mb-4 p-4 rounded-md border border-gray-300 dark:border-gray-700"
          >
            {/* Close Button */}
            <Button
              type="button"
              onClick={() => handleRemoveMilestone(index)}
              className="absolute top-2 right-2 bg-transparent dark:bg-transparent hover:dark:bg-transparent hover:bg-transparent text-sm"
              aria-label="Remove milestone"
            >
              <i className="fa-solid fa-xmark text-black hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400"></i>
            </Button>

            {/* Title + Amount + Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <InputSection<Milestone>
                name="title"
                value={milestone.title}
                onChange={(val: string) =>
                  handleMilestoneChange(index, "title", val)
                }
                placeholder="Add Title"
                label="Title"
                error={errors.milestones?.[index]?.title}
              />
              <InputSection<Milestone>
                name="amount"
                type="number"
                value={String(milestone.amount)}
                onChange={(val: string) =>
                  handleMilestoneChange(index, "amount", val)
                }
                placeholder="₹ 5620.00"
                label="Amount (INR)"
                error={errors.milestones?.[index]?.amount}
              />
              <InputSection<Milestone>
                name="dueDate"
                type="date"
                value={milestone.dueDate || ""}
                onChange={(val: string) =>
                  handleMilestoneChange(index, "dueDate", val)
                }
                label="Due Date"
                error={errors.milestones?.[index]?.dueDate}
              />
            </div>

            {/* Description */}
            <TextAreaSection<IProposal>
              name="description"
              value={milestone.description || ""}
              onChange={(val: string) =>
                handleMilestoneChange(index, "description", val)
              }
              placeholder="Describe milestone..."
              label="Description"
              rows={3}
              error={errors.milestones?.[index]?.description}
            />
          </div>
        ))}
        <button
          onClick={handleAddMilestone}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          + Add Milestone
        </button>
      </div>

      {/* Optional Upgrades */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Optional Upgrades
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          (No add-ons available currently)
        </p>
      </div>

      {/* Submit Button */}
      <Button
        label={loading ? "Submitting..." : "Place Bid"}
        onClick={handleSubmit}
        className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
      />
    </section>
  );
};

export default PlaceBidPage;