import { Document, Types } from "mongoose";

export interface IPlan {
  userType: "client" | "freelancer";
  planName: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  razorPlanIdMonthly: string;
  razorPlanIdYearly: string;
  features: Record<string, boolean | number>;
  active: boolean;
}

export interface IPlanDocument extends IPlan, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}