import { Types } from "mongoose";
import { IJobAssignmentDocument, IMilestone } from "./jobAssignment.type";

export type ApprovedMilestoneAssignment = Omit<
  IJobAssignmentDocument,
  "milestones"
> & {
  milestones: IMilestone & {
    _id: Types.ObjectId;
    paymentId?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
  };
};
