import { Document, Types } from "mongoose";

export interface PlanFeatures {
  // Common features
  VerifiedBadge: boolean;
  PremiumSupport: boolean;
  BestMatch: boolean;

  // Client-specific features
  HigherJobVisibility: boolean;
  UnlimitedInvites: boolean;
  DirectMessaging: boolean;
  AIProposalShortlisting: boolean;

  // Freelancer-specific features
  HigherProfileVisibility: boolean;
  UnlimitedProposals: boolean;
  PriorityNotifications: boolean;
}

export interface IPlan {
  userType: "client" | "freelancer";
  planName: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  razorPlanIdMonthly: string;
  razorPlanIdYearly: string;
  features: PlanFeatures;
  active: boolean;
}

export interface IPlanDocument extends IPlan, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}