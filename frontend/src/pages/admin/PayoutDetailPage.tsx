import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import InfoCard from "../../components/ui/Card/InfoCard";
import ProfileImage from "../../components/user/profile/ProfileImage";
import { paymentService } from "../../services/payment.service";
import { notify } from "../../utils/toastService";
import { jobAssignmentService } from "../../services/jobAssignments.service";

interface PayoutAssignment {
  assignmentId: string;
  job: {
    id: string;
    title: string;
    payment: { budget: number; type: string };
  };
  freelancer: { id: string; name: string; email: string };
  milestone: {
    id: string;
    title: string;
    description: string;
    amount: number;
    status: string;
    submittedAt?: string;
    submissionMessage?: string;
    submissionFiles: { url: string; name: string; type: string; key: string }[];
  };
  payment: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    provider: string;
    method: string;
    paymentDate: string;
  };
}

const PayoutDetailPage: React.FC = () => {
  const { assignmentId, milestoneId } = useParams();
  const [assignment, setAssignment] = useState<PayoutAssignment>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  
  if (!assignmentId || !milestoneId) return null;

  useEffect(() => {
    const fetchPayout = async () => {
      try {
        const res = await jobAssignmentService.getApprovedMilestoneById(assignmentId, milestoneId);
        if (res.data.success) {
          setAssignment(res.data.assignment);
        }
      } catch (error: any) {
        notify.error(error.response?.data?.error || "Failed to load payout");
      } finally {
        setLoading(false);
      }
    };
    fetchPayout();
  }, [assignmentId, milestoneId]);

  const handleRelease = async () => {
    if (!assignment?.payment?.id) return;
    try {
      setSubmitting(true);
      await paymentService.releaseMilestone(assignment.payment.id); 
      notify.success("Payout released successfully");

      navigate(-1)
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to release payout");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Loading payout details...</p>;
  }

  if (!assignment) {
    return <p className="p-6 text-center text-red-500">Payout not found.</p>;
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        {/* Header */}
        <h1 className="text-xl font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          Payout Details
        </h1>

        {/* Job Info */}
        <InfoCard title="Job">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {assignment.job.title} (Budget: ₹{assignment.job.payment.budget})
          </p>
        </InfoCard>

        {/* Freelancer Info */}
        <InfoCard title="Freelancer">
          <ProfileImage src={""} size={50} /> {/* optional profile image */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {assignment.freelancer.name} ({assignment.freelancer.email})
          </p>
        </InfoCard>

        {/* Milestone Info */}
        <InfoCard title="Milestone">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {assignment.milestone.title} — ₹{assignment.milestone.amount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Status: {assignment.milestone.status}
          </p>
          {assignment.milestone.submissionMessage && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Submission: {assignment.milestone.submissionMessage}
            </p>
          )}
          {assignment.milestone.submittedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Submitted At: {new Date(assignment.milestone.submittedAt).toLocaleString()}
            </p>
          )}
          {assignment.milestone.submissionFiles?.length > 0 && (
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mt-2">
              {assignment.milestone.submissionFiles.map((file) => (
                <li key={file.key}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {file.name} ({file.type})
                  </a>
                </li>
              ))}
            </ul>
          )}
        </InfoCard>

        {/* Payment Info */}
        <InfoCard title="Payment">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Provider: {assignment.payment.provider} ({assignment.payment.method})
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Amount: ₹{assignment.payment.amount} {assignment.payment.currency}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Status: {assignment.payment.status}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Date: {new Date(assignment.payment.paymentDate).toLocaleString()}
          </p>
        </InfoCard>

        {/* Release Button */}
        <div className="flex flex-wrap gap-3 mt-6">
          {submitting ? (
            <span className="text-sm text-gray-500">Submitting...</span>
          ) : (
            <Button
              label="Release Payout"
              onClick={handleRelease}
              variant="primary"
              className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-gray-600"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default PayoutDetailPage;