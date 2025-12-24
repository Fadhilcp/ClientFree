import { Types } from "mongoose";
import { IPaymentDocument } from "./payment.type";

export type PopulatedPayment = Omit<
  IPaymentDocument,
  "jobId" | "milestoneId" | "clientId" | "freelancerId" | "userId"
> & {
  jobId?: {
    _id: Types.ObjectId;
    title: string;
    category: string;
    subcategory: string;
    description: string;
    duration: string;
    payment: {
      budget: number;
      type: "fixed" | "hourly";
    };
    skills?: string[];
  };

  milestoneId?: {
    _id: Types.ObjectId;
  } | Types.ObjectId;

  clientId?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    profileImage?: string | null;
    company?: {
      name: string;
      industry: string;
      website: string;
    } | null;
  };

  freelancerId?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    profileImage?: string | null;
    professionalTitle?: string | null;
    experienceLevel?: string | null;
    hourlyRate?: string | null;
    about?: string | null;
  };

  userId?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
};
