import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import ProfileImage from "../../../components/user/profile/ProfileImage";
import type { ActionItem } from "../../../components/ui/Card/Card";
import { paymentService } from "../../../services/payment.service";
import InfoCard from "../../../components/ui/Card/InfoCard";
import AdminModal from "../../../components/ui/Modal/AdminModal";
import type { AdminDisputeDto } from "../../../types/admin/Dispute.type";
import { notify } from "../../../utils/toastService";

const modalFields = [
  {
    name: "reason" as const,
    label: "Refund Reason",
    placeholder: "Enter refund reason",
  },
];

const DisputeDetailPage: React.FC = () => {
  const { id } = useParams();
  const [dispute, setDispute] = useState<AdminDisputeDto>();
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState<{ reason: string }>({
    reason: "",
  });

  const canResolveDispute =
    dispute?.isDisputed === true &&
    dispute?.status === "completed" &&
    !submitting;


  useEffect(() => {
    const fetchDispute = async () => {
        if(!id) return;
      try {
        const res = await paymentService.getDisputeById(id);
        if(res.data.success){
            const { dispute } = res.data;
            setDispute(dispute);
        }
      } catch (error: any) {
        console.error("Error fetching dispute:", error);
        notify.error(error.response?.data?.error || 'Failed to load disputes');
      } finally {
        setLoading(false);
      }
    };
    fetchDispute();
  }, [id]);

  const handleRefundSubmit = async () => {
    if (!dispute?.id) return;

    try {
      setSubmitting(true);

      await paymentService.refundMilestone(
        dispute.id,
        formData
      );
      notify.success("Payment Refunded");

      setModalOpen(false);
      setFormData({ reason: "" });

      navigate(-1);

      // refresh dispute
      // const res = await paymentService.getDisputeById(id!);
      // console.log("🚀 ~ handleRefundSubmit ~ res:", res)
      // if (res.data.success) {
      //   setDispute(res.data.dispute);
      // }

    } catch (error: any) {
      console.error("Refund failed", error);
      notify.error(error.response?.data?.error || 'Failed to refund to freelancer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseToFreelancer = async () => {
    if (!dispute?.id) return;

    try {
      setSubmitting(true);

      await paymentService.releaseMilestone(dispute.id);
      notify.success("Payment Released");

      navigate(-1);

      const res = await paymentService.getDisputeById(id!);
      if (res.data.success) {
        setDispute(res.data.dispute);
      }
    } catch (error: any) {
      console.error("Release failed", error);
      notify.error(error.response?.data?.error || 'Failed to release to freelancer');
    } finally {
      setSubmitting(false);
    }
  };


  const openRefundModal = () => {
    setModalOpen(true);
  };

  if (loading) {
    return <p className="p-6 text-center">Loading dispute details...</p>;
  }

  if (!dispute) {
    return <p className="p-6 text-center text-red-500">Dispute not found.</p>;
  }

  // Define action buttons dynamically
  const actions: ActionItem[] = canResolveDispute ?[
    {
      label: "Release to Client",
      variant: "secondary",
      onClick: openRefundModal,
    },
    {
      label: "Release to Freelancer",
      variant: "primary",
      onClick: handleReleaseToFreelancer,
    },
  ] : [];

return (
  <section className="bg-gray-50 dark:bg-gray-900">

    <AdminModal
      isOpen={isModalOpen}
      onClose={() => setModalOpen(false)}
      onSubmit={handleRefundSubmit}
      formData={formData}
      onChange={(name, value) =>
        setFormData(prev => ({ ...prev, [name]: value }))
      }
      title="Refund Milestone"
      fields={modalFields}
      errors={{}}
    />

    <div className="max-w-5xl mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      {/* Header */}
      <h1 className="text-xl font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        Dispute Details
      </h1>

      {/* Dispute Info */}
      <div className="mb-4 space-y-1">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Reason:</span> {dispute.disputeReason}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Amount:</span> ₹{dispute.amount} {dispute.currency}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Status:</span> {dispute.status}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Created: {new Date(dispute.createdAt).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Updated: {new Date(dispute.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Raised By */}
      <InfoCard title="Raised By">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {dispute.raisedBy?.name} ({dispute.raisedBy?.email})
        </p>
      </InfoCard>

      {/* Client & Freelancer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <InfoCard title="Client">
          <ProfileImage src={dispute.client?.profileImage!} size={50} />
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {dispute.client?.name} ({dispute.client?.email})
          </p>
        </InfoCard>

        <InfoCard title="Freelancer">
          <ProfileImage src={dispute.freelancer?.profileImage!} size={50} />
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {dispute.freelancer?.name} ({dispute.freelancer?.email})
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {dispute.freelancer?.professionalTitle} • {dispute.freelancer?.experienceLevel}
          </p>
        </InfoCard>
      </div>

      {/* Payment Info */}
      <InfoCard title="Payment">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Provider: {dispute.payment.provider} ({dispute.payment.method})
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Order ID: {dispute.payment.providerOrderId}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Date: {dispute.payment.paymentDate ? dispute.payment.paymentDate.toLocaleString() : ""}
        </p>
      </InfoCard>


      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6">
        {submitting ? (
          <span className="text-sm text-gray-500">Submitting...</span>
        ) : (
          actions.map((action, idx) => (
            <Button
              key={idx}
              label={action.label}
              onClick={action.onClick}
              variant={action.variant}
              className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-gray-600"
            />
          ))
        )}
      </div>
    </div>
  </section>
);
};

export default DisputeDetailPage;