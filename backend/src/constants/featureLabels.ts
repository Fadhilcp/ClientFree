import { PlanFeatures } from "../types/plan.type";

export const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  VerifiedBadge: "Verified Badge",
  PremiumSupport: "Premium Customer Support",
  BestMatch: "Best Match Recommendation",
  HigherJobVisibility: "Higher Job Visibility",
  UnlimitedInvites: "Unlimited Invites",
  DirectMessaging: "Direct Messaging Access",
  AIProposalShortlisting: "AI Proposal Shortlisting",
  HigherProfileVisibility: "Higher Profile Visibility",
  UnlimitedProposals: "Unlimited Proposals",
  PriorityNotifications: "Priority Notifications"
};