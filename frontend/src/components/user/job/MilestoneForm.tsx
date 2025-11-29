import React, { useEffect, useState } from "react";
import InputSection from "../../ui/InputSection";
import TextAreaSection from "../../ui/TextAreaSection";
import Button from "../../ui/Button";
import Card, { type ActionItem } from "../../ui/Card/Card";
import type { Milestone, MilestoneDto } from "../../../types/job/assignment.type";

interface MilestoneFormProps {
  initialMilestones?: MilestoneDto[];
  onSubmit: (milestones: MilestoneDto[]) => void;
  onUpdateMilestone?: (index: number, milestone: MilestoneDto) => void;
  submitLabel?: string;
  onCancelMilestone?: (milestoneId: string) => void;
  onFundMilestone?: (milestoneId: string, amount: number) => Promise<void>;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  initialMilestones = [],
  onSubmit,
  onUpdateMilestone,
  submitLabel = "Save Milestones",
  onCancelMilestone,
  onFundMilestone,
}) => {
  const [milestones, setMilestones] = useState<MilestoneDto[]>(initialMilestones);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { title: "", amount: 0, description: "", dueDate: "" },
    ]);
    setEditingIndex(milestones.length);
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof Milestone,
    value: string
  ) => {
    const updated = [...milestones];
    if (field === "amount") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setMilestones(updated);
  };

  const handleRemoveMilestone = (index: number, milestoneId?: string) => {
    if(milestoneId){
      setEditingIndex(null);
    }else { 
      const updated = [...milestones];
    updated.splice(index, 1);
    setMilestones(updated);
    }
  };

  const handleCancelMilestone = (index: number) => {
    const current = milestones[index];
    if(!current.id){
      handleRemoveMilestone(index);
    }
    setEditingIndex(null);
  }

  const handleSubmit = () => {
    onSubmit(
      milestones
      .filter(m => !m.id)
      .map((m) => ({
        ...m,
        amount: Number(m.amount),
        dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined,
      } as MilestoneDto))
    );
    setEditingIndex(null);
  };

  const handleFund = async(milestoneId: string, amount: number) => {
    if(onFundMilestone){
      await onFundMilestone(milestoneId, amount)
    }
  }
  const firstPendingIndex = milestones.findIndex((m) => m.status === "draft");


  return (
    <div className="mb-6">
      <h2 className="text-md font-medium text-gray-800 dark:text-white mb-4">
        Milestones
      </h2>

      {milestones.map((milestone, index) => (
        <div key={index} className="mb-4">
          {editingIndex === index ? (
            // --- Edit Mode ---
            <div className="relative mb-4 p-4 rounded-md border border-gray-300 dark:border-gray-700">
              <Button
                type="button"
                onClick={() => handleRemoveMilestone(index, milestone.id)}
                className="absolute top-2 right-2 bg-transparent text-sm"
              >
                ✕
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <InputSection<Milestone>
                  name="title"
                  value={milestone.title}
                  onChange={(val: string) =>
                    handleMilestoneChange(index, "title", val)
                  }
                  placeholder="Add Title"
                  label="Title"
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
                />
                <InputSection<Milestone>
                  name="dueDate"
                  type="date"
                  value={milestone.dueDate || ""}
                  onChange={(val: string) =>
                    handleMilestoneChange(index, "dueDate", val)
                  }
                  label="Due Date"
                />
              </div>

              <TextAreaSection<Milestone>
                name="description"
                value={milestone.description || ""}
                onChange={(val: string) =>
                  handleMilestoneChange(index, "description", val)
                }
                placeholder="Describe milestone..."
                label="Description"
                rows={3}
              />

              <div className="flex gap-3 mt-4">
                <Button
                  label="Save"
                  onClick={() => {
                    const current = milestones[index];

                    if (current.id && onUpdateMilestone) {
                      onUpdateMilestone(index, milestones[index]); 
                      setEditingIndex(null);
                    } else {
                      handleSubmit();
                    }
                  }}
                  variant="primary"
                  className="px-4 py-2"
                />
                <Button
                  label="Cancel"
                  onClick={() => handleCancelMilestone(index)}
                  variant="secondary"
                  className="px-4 py-2"
                />
              </div>
            </div>
          ) : (
            // --- View Mode (Card) ---
            
            <Card
              title={milestone.title || "Untitled Milestone"}
              description={milestone.description}
              meta={[
                { label: "Amount", value: `₹ ${milestone.amount}` },
                {
                  label: "Due Date",
                  value: milestone.dueDate
                    ? new Date(milestone.dueDate).toLocaleDateString()
                    : "N/A",
                },
              ]}
              status={milestone.status || "pending"}
              actions={[
                milestone.status === "draft" ? 
                {
                  label: "Edit",
                  onClick: () => setEditingIndex(index),
                  variant: "secondary",
                } : null,
                milestone.id && milestone.status === "draft"
                  ? {
                      label: "Cancel",
                      onClick: () => onCancelMilestone?.(milestone.id!),
                      variant: "secondary",
                    }
                  : null,
                  milestone.status === "draft" && index === firstPendingIndex
                  ? {
                      label: "Fund",
                      onClick: () =>
                        handleFund(milestone.id!, milestone.amount),
                      variant: "primary",
                    }
                  : null,
              ].filter(Boolean) as ActionItem[]}
            />
          )}
        </div>
      ))}

      {/* Action buttons with spacing */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleAddMilestone}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          + Add Milestone
        </button>

        <Button
          label={submitLabel}
          onClick={handleSubmit}
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        />
      </div>
    </div>
  );
};

export default MilestoneForm;