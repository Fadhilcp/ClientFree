import { Types } from "mongoose";
import { IJobAssignmentDocument, IMilestone } from "./jobAssignment.type";

export type PopulatedMilestone = IMilestone & {
  _id: Types.ObjectId;
  paymentId?: {
    _id: Types.ObjectId;
    status: string;
    amount: number;
    currency: string;
    provider: string;
    method: string;
    paymentDate: Date;
  } | null;
};

export type PopulatedAssignment = Omit<
  IJobAssignmentDocument,
  "jobId" | "freelancerId" | "milestones"
> & {
  jobId: {
    _id: Types.ObjectId;
    title: string;
    payment?: {
      budget?: number;
      type?: string;
    };
  };
  freelancerId: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
  milestones: PopulatedMilestone[];
};
