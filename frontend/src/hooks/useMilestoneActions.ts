import { jobAssignmentService } from "../services/jobAssignments.service";
import { paymentService } from "../services/payment.service";
import { notify } from "../utils/toastService";
import { env } from "../config/env";
import type { Milestone, MilestoneDto } from "../types/job/assignment.type";

export const useMilestoneActions = (
  assignmentId: string,
  setJobAssignments: React.Dispatch<React.SetStateAction<any[]>>,
  user: any
) => {
  const addMilestones = async (milestones: MilestoneDto[]) => {
    try {
      const res = await jobAssignmentService.addMilestones(assignmentId, milestones);
      if (res.data.success) {
        notify.success("Milestones added successfully");
        const { assignment } = res.data;
        setJobAssignments(prev =>
          prev.map(a => (a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a))
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
          prev.map(a => (a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a))
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
          prev.map(a => (a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a))
        );
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to cancel milestone");
    }
  };

  const fundMilestone = async (milestoneId: string, amount: number) => {
    if (!user.isProfileComplete) {
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
              const verifyRes = await paymentService.verifyMilestone({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature || "",
              });
              if (verifyRes.data.success) {
                const { assignment } = verifyRes.data;
                setJobAssignments(prev =>
                  prev.map(a => (a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a))
                );
                notify.success(verifyRes.data.message || "Milestone funded successfully");
              }
            } catch (err: any) {
              notify.error(err.response?.data?.error || "Verification failed");
            }
          },
          prefill: { name: user?.id, email: user?.email, contact: user?.phone },
          theme: { color: "#6366f1" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to fund milestone");
    }
  };

  const submitMilestone = async (milestoneId: string, note: string, files: File[]) => {
    try {
      const formData = new FormData();
      formData.append("note", note);
      files.forEach(file => formData.append("files", file));
      const response = await jobAssignmentService.submitWork(assignmentId, milestoneId, formData);
      if (response.data.success) {
        notify.success("Milestone submitted successfully");
        const { assignment } = response.data;
        setJobAssignments(prev =>
          prev.map(a => (a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a))
        );
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to submit milestone");
    }
  };

  const approveMilestone = async (milestoneId: string) => {
    try {
      const response = await jobAssignmentService.approveMilestone(assignmentId, milestoneId);
      if (response.data.success) {
        notify.success("Milestone approved successfully");
        const { assignment } = response.data;
        setJobAssignments(prev =>
          prev.map(a => (a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a))
        );
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to approve milestone");
    }
  };

  const requestChangeMilestone = async (milestoneId: string) => {
    try {
      const response = await jobAssignmentService.requestChange(assignmentId, milestoneId);
      if (response.data.success) {
        const { assignment } = response.data;
        notify.success("Change requested successfully");
        setJobAssignments(prev =>
          prev.map(a => (a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a))
        );
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to request change");
    }
  };

  const submitDispute = async (
    selectedMilestoneId: string,
    disputeForm: { reason: string },
    setDisputeErrors: (errors: any) => void,
    setDisputeForm: (form: any) => void,
    setIsDisputeModalOpen: (open: boolean) => void
  ) => {
    if (!selectedMilestoneId) return;
    if (!disputeForm.reason.trim()) {
      setDisputeErrors({ reason: "Reason is required" });
      return;
    }
    try {
      const response = await jobAssignmentService.diputeMilestone(assignmentId, selectedMilestoneId, disputeForm);
      if (response.data.success) {
        const { assignment } = response.data;
        notify.success("Dispute raised successfully");
        setJobAssignments(prev =>
          prev.map(a => (a.id === assignmentId ? { ...a, milestones: assignment.milestones } : a))
        );
        setIsDisputeModalOpen(false);
        setDisputeForm({ reason: "" });
        setDisputeErrors({});
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to raise dispute");
    }
  };

  return {
    addMilestones,
    editMilestone,
    cancelMilestone,
    fundMilestone,
    submitMilestone,
    approveMilestone,
    requestChangeMilestone,
    submitDispute,
  };
};