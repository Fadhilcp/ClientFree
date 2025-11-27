import React, { useState } from "react";
import InputSection from "../../ui/InputSection";
import TextAreaSection from "../../ui/TextAreaSection";
import Button from "../../ui/Button";
import type { Milestone, MilestoneDto } from "../../../types/job/assignment.type";

interface MilestoneFormProps {
  initialMilestones?: Milestone[];
  onSubmit: (milestones: MilestoneDto[]) => void;
  submitLabel?: string;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  initialMilestones = [],
  onSubmit,
  submitLabel = "Save Milestones",
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { title: "", amount: 0, description: "", dueDate: "" },
    ]);
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

  const handleRemoveMilestone = (index: number) => {
    const updated = [...milestones];
    updated.splice(index, 1);
    setMilestones(updated);
  };

  const handleSubmit = () => {
    onSubmit(
      milestones.map((m) => ({
        ...m,
        amount: Number(m.amount),
        dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined,
      } as MilestoneDto))
    );
  };

return (
  <div className="mb-6">
    <h2 className="text-md font-medium text-gray-800 dark:text-white mb-4">
      Milestones
    </h2>

    {milestones.map((milestone, index) => (
      <div
        key={index}
        className="relative mb-4 p-4 rounded-md border border-gray-300 dark:border-gray-700"
      >
        <Button
          type="button"
          onClick={() => handleRemoveMilestone(index)}
          className="absolute top-2 right-2 bg-transparent dark:bg-transparent hover:dark:bg-transparent hover:bg-transparent text-sm"
        >
          <i className="fa-solid fa-xmark text-black hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400"></i>
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