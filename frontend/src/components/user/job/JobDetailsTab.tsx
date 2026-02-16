import { useEffect, useState } from "react";
import type { User } from "../../../features/authSlice";
import { chatService } from "../../../services/chat.service";
import type { AssignmentDto } from "../../../types/job/assignment.type";
import type { JobDetailDTO } from "../../../types/job/job.dto";
import type { SkillItem } from "../../../types/skill.types";
import { notify } from "../../../utils/toastService";
import Button from "../../ui/Button";
import Card, { type ActionItem } from "../../ui/Card/Card";
import CreateReviewSection from "../reviews/CreateReviewSection";
import ClarificationBoard from "./ClarificationBoard";
import JobDetails from "./JobDetails";
import MilestoneForm from "./MilestoneForm";
import PlaceBidPage from "./PlaceBidForm";
import type { ProposalCheckStatusResponse } from "../../../types/job/proposal.type";
import { proposalService } from "../../../services/proposal.service";
import { reviewService } from "../../../services/review.service";
import type { ReviewDto } from "../../../types/review.types";
import Spinner from "../../ui/Loader/Spinner";

interface JobDetailsTabProps {
  job: JobDetailDTO;
  user: User | null;
  isJobOwner: boolean;
  jobAssignments: AssignmentDto[] | undefined;
  setJobAssignments: React.Dispatch<React.SetStateAction<any[]>>;
  fetchAssignment: () => void;
  canStartJob: boolean;
  handleStartJob: () => void;
  navigate: (path: string) => void;
  handleViewProfile: (userId: string) => void;
}


const JobDetailsTab: React.FC<JobDetailsTabProps> = ({
  job,
  user,
  isJobOwner,
  jobAssignments,
  setJobAssignments,
  fetchAssignment,
  canStartJob,
  handleStartJob,
  navigate,
  handleViewProfile,
}) => {

    const [proposalStatus, setProposalStatus] = useState<ProposalCheckStatusResponse | null>(null);
    const [existingReview, setExistingReview] = useState<ReviewDto | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    const fetchProposalStatus = async () => {
      if (!user || user.role !== "freelancer") return;

      const res = await proposalService.getProposalIsSubmitted(job.id);
      setProposalStatus(res.data.data);
    };

    useEffect(() => {
      fetchProposalStatus();
    }, [job.id, user?.id]);

    useEffect(() => {
      if (job.status !== "completed") return;

      const fetchReview = async () => {
        try {
          setReviewLoading(true);
          const res = await reviewService.getMyReviewForJob(job.id);
          setExistingReview(res.data.review ?? null);
        } catch {
          setExistingReview(null);
        } finally {
          setReviewLoading(false);
        }
      };

      fetchReview();
    }, [job.id, job.status]);

    const canPlaceBid =
      proposalStatus?.status === "NONE" ||
      proposalStatus?.status === "UPGRADE_PENDING";

    const isHiredFreelancer =
        user?.role === "freelancer" &&
        job.acceptedProposals?.some(
            (p) => p.freelancer?.id === user.id
        );


    const handleChat = async (receiverId: string) => {
        try {
            const res = await chatService.getOrCreateChat(receiverId, job.id);
            if (res.data.success) {
                navigate(`/chats`);
            }
        } catch (err) {
            notify.error("Failed to open chat");
        }
    };

  return (
    <div className="p-8">
      <JobDetails job={job} />

      {job.status === "completed" && (
        <>
        {reviewLoading &&   
          <div className="flex justify-center">
            <Spinner size={30} />
          </div>
        }
        <CreateReviewSection jobId={job.id} 
          existingReview={existingReview}
          onReviewSaved={setExistingReview}
        />
        </>
      )}

      <div className="my-8 border-t border-gray-200 dark:border-gray-700 opacity-70"></div>

      {/* Client Info */}
      {!isJobOwner && job.client && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
            Job Posted By
          </h2>

          <Card
            user={job.client}
            isVerified={job.client.isVerified}
            title={job.client.name}
            subtitle={`@${job.client.username}`}
            description={job.client.description}
            tags={job.client.company?.name ? [job.client.company.name] : []}
            meta={[
              {
                label: "Location",
                value: job.client.location
                  ? [
                      job.client.location.city,
                      job.client.location.state,
                      job.client.location.country,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "Not specified",
              },
            ]}
            actions={[
              {
                label: "View Profile",
                onClick: () => navigate(`/users/${job.client.id}`),
                variant: "secondary",
              },
              isHiredFreelancer ? {
                label: "Chat",
                onClick: () => handleChat(job.client.id),
                variant: "primary",
              } : null,
            ].filter(Boolean) as ActionItem[]}
          />

          <div className="my-8 border-t border-gray-200 dark:border-gray-700 opacity-70"></div>
        </div>
      )}

      {/* Freelancer not selected notice */}
      {user?.role === "freelancer" &&
        job.status === "active" &&
        !(job.acceptedProposals ?? []).some(
          (p) => p.freelancer?.id === user.id
        ) && (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md shadow-sm">
            You were not selected for this job.
          </div>
        )}

      {/* Hired Freelancers */}
        <div className="space-y-6">
          {isJobOwner &&
            job.acceptedProposals &&
            job.acceptedProposals.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                  {job.acceptedProposals.length > 1
                    ? "Hired Freelancers"
                    : "Hired Freelancer"}
                </h2>
                <div className="space-y-6">
                  {job.acceptedProposals.map((p: any) => (
                    <Card
                      key={p.id}
                      user={p.freelancer ?? undefined}
                      isVerified={p.freelancer.isVerified}
                      title={p.freelancer.professionalTitle || p.freelancer.name}
                      subtitle={`Bid: ₹${p.bidAmount} • Duration: ${p.duration}`}
                      description={p.description}
                      status={p.status}
                      tags={
                        p.freelancer.skills
                          ? p.freelancer.skills.map((s: SkillItem) => s.name)
                          : []
                      }
                      meta={[
                        { label: "Experience", value: p.freelancer.experienceLevel },
                        { label: "Hourly Rate", value: p.freelancer.hourlyRate },
                      ]}
                      footer={`Accepted on: ${new Date(
                        p.updatedAt
                      ).toLocaleDateString()}`}
                      actions={[
                        {
                          label: "View Profile",
                          onClick: () => handleViewProfile(p.freelancer.id),
                          variant: "secondary" as const,
                        },
                        {
                          label: "Chat",
                          onClick: () => handleChat(p.freelancer.id),
                          variant: "primary" as const,
                        },
                      ]}
                    />
                  ))}
                </div>
                <div className="my-8 border-t border-gray-200 dark:border-gray-700 opacity-70"></div>
              </div>
            )}
        </div>

      {/* Milestones */}
      {jobAssignments?.map((assignment) => {
        const canViewMilestones =
          user?.role === "client" ||
          (user?.role === "freelancer" &&
            assignment.freelancer.id === user.id);

        if (!canViewMilestones) return null;

        return (
          <div key={assignment.id} className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Milestones for{" "}
              <span className="text-indigo-600 dark:text-indigo-500">
                {assignment.freelancer.name}
              </span>
            </h2>

            <MilestoneForm
              assignmentId={assignment.id}
              initialMilestones={assignment.milestones || []}
              user={user as User}
              setJobAssignments={setJobAssignments}
              freelancerId={assignment.freelancer.id}
              jobStatus={job.status}
              refetchAssignment={fetchAssignment}
            />
          </div>
        );
      })}

      {/* Place Bid */}
      {user?.role === "freelancer" && job.status === "open" && (
        canPlaceBid ? (
          <div className="space-y-3">
            {proposalStatus?.status === "UPGRADE_PENDING" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md
                              text-yellow-700 dark:text-yellow-300 text-sm">
                {proposalStatus.message}
              </div>
            )}

            <PlaceBidPage
              user={user}
              jobId={job.id}
              isProfileComplete={user.isProfileComplete}
              onBidSuccess={fetchProposalStatus}
            />
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-md
                          text-yellow-700 dark:text-yellow-300">
            {proposalStatus?.message}
          </div>
        )
      )}

      <div className="my-4 border-t border-gray-200 dark:border-gray-700 opacity-70"></div>
      {isJobOwner && job.status === "open" && canStartJob && (
        <Button
          label="Start Job"
          onClick={handleStartJob}
          className=" px-6 py-3 rounded-lg"
        />
      )}

      {/* Start Job */}

      {/* Clarification Board */}
      {job.status === "open" && (
        <div className="mt-10">
          <ClarificationBoard jobId={job.id} />
        </div>
      )}
    </div>
  );
};

export default JobDetailsTab;
