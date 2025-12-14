import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import ProfileImage from "../../../components/user/profile/ProfileImage";
import type { ActionItem } from "../../../components/ui/Card/Card";
import { paymentService } from "../../../services/payment.service";
import InfoCard from "../../../components/ui/Card/InfoCard";

const DisputeDetailPage: React.FC = () => {
  const { id } = useParams();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispute = async () => {
        if(!id) return;
      try {
        const res = await paymentService.getDisputeById(id);
        if(res.data.success){
            const { dispute } = res.data;
            setDispute(dispute);
        }
      } catch (err) {
        console.error("Error fetching dispute:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDispute();
  }, [id]);

  if (loading) {
    return <p className="p-6 text-center">Loading dispute details...</p>;
  }

  if (!dispute) {
    return <p className="p-6 text-center text-red-500">Dispute not found.</p>;
  }

  // Define action buttons dynamically
  const actions = [
    {
      label: "Release to Client",
      variant: "secondary",
      onClick: () => console.log("Release to Client", dispute.id),
    },
    {
      label: "Release to Freelancer",
      variant: "primary",
      onClick: () => console.log("Release to Freelancer", dispute.id),
    },
    {
      label: "Split Half",
      variant: "secondary",
      onClick: () => console.log("Split Half", dispute.id),
    },
  ].filter(Boolean) as ActionItem[];

return (
  <section className="bg-gray-50 dark:bg-gray-900">
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
          {dispute.raisedBy.name} ({dispute.raisedBy.email})
        </p>
      </InfoCard>

      {/* Client & Freelancer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <InfoCard title="Client">
          <ProfileImage src={dispute.client.profileImage} size={50} />
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {dispute.client.name} ({dispute.client.email})
          </p>
        </InfoCard>

        <InfoCard title="Freelancer">
          <ProfileImage src={dispute.freelancer.profileImage} size={50} />
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {dispute.freelancer.name} ({dispute.freelancer.email})
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {dispute.freelancer.professionalTitle} • {dispute.freelancer.experienceLevel}
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
          Date: {new Date(dispute.payment.paymentDate).toLocaleString()}
        </p>
      </InfoCard>


      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6">
        {actions.map((action, idx) => (
          <Button
            key={idx}
            label={action.label}
            onClick={action.onClick}
            variant={action.variant}
            className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-gray-600"
          />
        ))}
      </div>
    </div>
  </section>
);
};

export default DisputeDetailPage;