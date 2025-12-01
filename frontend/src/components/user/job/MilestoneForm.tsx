import React, { useEffect, useState } from "react";
import InputSection from "../../ui/InputSection";
import TextAreaSection from "../../ui/TextAreaSection";
import Button from "../../ui/Button";
import Card, { type ActionItem } from "../../ui/Card/Card";
import type { Milestone, MilestoneDto } from "../../../types/job/assignment.type";
import { notify } from "../../../utils/toastService";
import { jobAssignmentService } from "../../../services/jobAssignments.service";
import { paymentService } from "../../../services/payment.service";
import { env } from "../../../config/env";

interface MilestoneFormProps {
  assignmentId: string;
  initialMilestones?: MilestoneDto[];
  user: any;
  setJobAssignments: React.Dispatch<React.SetStateAction<any[]>>;
  freelancerId: string;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  assignmentId,
  initialMilestones = [],
  user,
  setJobAssignments,
  freelancerId,
}) => {

  const [milestones, setMilestones] = useState<MilestoneDto[]>(initialMilestones);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  const addMilestones = async (milestones: MilestoneDto[]) => {
    try {
      const res = await jobAssignmentService.addMilestones(assignmentId, milestones);
      if (res.data.success) {
        notify.success("Milestones added successfully");
        const { assignment } = res.data;

        setJobAssignments(prev =>
          prev.map(a => a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a)
        );
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to add milestones");
    }
  };

  const editMilestone = async (milestoneId: string, milestone: Milestone) => {
    try {
      const response = await jobAssignmentService.updateMilestone(assignmentId, milestoneId, milestone);

      if (response.data.success) {
        notify.success("Milestone updated successfully");
        const { assignment } = response.data;

        setJobAssignments(prev =>
          prev.map(a => a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a)
        );
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to update milestone");
    }
  };

  const cancelMilestone = async (milestoneId: string) => {
    try {
      const response = await jobAssignmentService.cancelMilestone(assignmentId, milestoneId);

      if (response.data.success) {
        notify.success("Milestone cancelled successfully");
        const { assignment } = response.data;

        setJobAssignments(prev =>
          prev.map(a => a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a)
        );
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to cancel milestone");
    }
  };

  
  const fundMilestone = async (milestoneId: string, amount: number) => {
    if (!user?.id || !user?.email || !user?.phone) {
      notify.warn("Please complete your profile before funding milestones");
      return;
    }

    try {
      const response = await paymentService.fundMilestone(assignmentId, milestoneId);

      if (response.data.success) {
        const { order } = response.data;

        const options = {
          key: env.RAZORPAY_KEY_ID,
          amount: amount * 100,
          currency: "INR",
          order_id: order.id,
          handler: async (response: any) => {
            try {
              const vRes = await paymentService.verifyMilestone({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature || "",
              });

              if (vRes.data.success) {
                notify.success(vRes.data.message || "Milestone funded successfully");
              }
            } catch (err: any) {
              notify.error(err.response?.data?.error || "Verification failed");
            }
          },
          prefill: {
            name: user?.id,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: "#6366f1",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to fund milestone");
    }
  };
  
  const releaseMilestone = async (paymentId: string) => {
    try {
      const response = await paymentService.releaseMilestone(paymentId);
      console.log('release milestone - response-',response)
      if(response.data.success){
        const { assignment } = response.data;
        setJobAssignments(prev =>
          prev.map(a => a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a)
        );
      }
    } catch (error: any) {
      notify.error(error.response?.data?.err0r || "Failed to release milestone");
    }
  }

  const submitMilestone = async (milestoneId: string) => {
    try {
      
    } catch (error: any) {
      
    }
  }

  const handleAddMilestoneUI = () => {
    setMilestones(prev => [...prev, { title: "", amount: 0, description: "", dueDate: "", status: "draft" }]);
    setEditingIndex(milestones.length);
  };

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
    <div className="mb-6">
      <h2 className="text-md font-medium text-gray-800 dark:text-white mb-4">Milestones</h2>

      {milestones.map((milestone, index) => (
        <div key={index} className="mb-4">
          {editingIndex === index ? (
            <div className="relative mb-4 p-4 rounded-md border border-gray-300 dark:border-gray-700">
              <button
                type="button"
                onClick={() => handleCancelLocal(index)}
                className="absolute top-2 right-2 text-black dark:text-white text-sm"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <InputSection
                  name="title"
                  value={milestone.title}
                  onChange={(val: string) => handleMilestoneChange(index, "title", val)}
                  label="Title"
                  placeholder="Add Title"
                />
                <InputSection
                  name="amount"
                  type="number"
                  value={String(milestone.amount)}
                  onChange={(val: string) => handleMilestoneChange(index, "amount", val)}
                  label="Amount (INR)"
                />
                <InputSection
                  name="dueDate"
                  type="date"
                  value={milestone.dueDate || ""}
                  onChange={(val: string) => handleMilestoneChange(index, "dueDate", val)}
                  label="Due Date"
                />
              </div>

              <TextAreaSection
                name="description"
                value={milestone.description || ""}
                onChange={(val: string) => handleMilestoneChange(index, "description", val)}
                label="Description"
                placeholder="Describe milestone..."
              />

              <div className="flex gap-3 mt-4">
                <Button
                  label="Save"
                  onClick={() => {
                    const current = milestones[index];

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
    // --- CLIENT ACTIONS ---
    user?.role === "client" && milestone.status === "draft"
      ? { label: "Edit", onClick: () => setEditingIndex(index), variant: "secondary" }
      : null,

    user?.role === "client" && milestone.id && milestone.status === "draft"
      ? {
          label: "Cancel",
          onClick: () => cancelMilestone(milestone.id!),
          variant: "secondary",
        }
      : null,

    user?.role === "client" &&
    !hasFunded &&
    milestone.status === "draft" &&
    index === firstDraftIndex
      ? {
          label: "Fund",
          onClick: () => fundMilestone(milestone.id!, milestone.amount),
          variant: "primary",
        }
      : null,

    user?.role === "client" && milestone.status === "funded"
      ? {
          label: "Request Change",
          onClick: () => console.log("Request change for milestone:", milestone.id),
          variant: "secondary",
        }
      : null,

    user?.role === "client" && milestone.status === "funded"
      ? {
          label: "Release",
          onClick: () => milestone.paymentId && releaseMilestone(milestone.paymentId),
          variant: "primary",
        }
      : null,

    // --- FREELANCER ACTION ---
    user?.role === "freelancer" && milestone.status === "funded"
      ? {
          label: "Submit",
          onClick: () => {
            // Strong authorization: ensure only the assigned freelancer can submit
            if (freelancerId !== user.id) {
              notify.error("You are not authorized to submit this milestone.");
              return;
            }
            submitMilestone(milestone.id!);
          },
          variant: "primary",
        }
      : null,
  ].filter(Boolean) as ActionItem[]}
/>

          )}
        </div>
      ))}

      <button
        onClick={handleAddMilestoneUI}
        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-6"
      >
        + Add Milestone
      </button>
    </div>
  );
};

export default MilestoneForm;
