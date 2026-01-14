import { Schema, model } from "mongoose";
import { IPlanDocument } from "../types/plan.type";

const planSchema = new Schema({
  userType: { type: String, enum: ["client", "freelancer"], required: true },
  planName: { type: String, required: true },
  priceMonthly: { type: Number, required: true },
  priceYearly: { type: Number, required: true },

  // razorPlanIdMonthly: { type: String, required: true }, 
  // razorPlanIdYearly: { type: String, required: true },

  stripeProductId: { type: String, required: true },
  stripePriceIdMonthly: { type: String, required: true },
  stripePriceIdYearly: { type: String, required: true },

  features: {
    // Common features
    VerifiedBadge: { type: Boolean, default: false },
    PremiumSupport: { type: Boolean, default: false },
    BestMatch: { type: Boolean, default: false },

    // Client specific features
    HigherJobVisibility: { type: Boolean, default: false },
    UnlimitedInvites: { type: Boolean, default: false },
    DirectMessaging: { type: Boolean, default: false },
    AIProposalShortlisting: { type: Boolean, default: false },

    // Freelancer specific features
    HigherProfileVisibility: { type: Boolean, default: false },
    UnlimitedProposals: { type: Boolean, default: false },
    PriorityNotifications: { type: Boolean, default: false },
  },

  active: { type: Boolean, default: true },
}, { timestamps: true });

export default model<IPlanDocument>("Plan", planSchema);