import { Document, Types } from "mongoose";

export interface ITask {
  id?: string;
  title?: string;
  status?: "pending" | "inProgress" | "completed" | "cancelled";
  dueDate?: Date;
}

export type IMilestoneStatus =
  | "created"
  | "funded"
  | "released"
  | "refunded"
  | "disputed"
  | "cancelled";

export interface IMilestone {
  title: string;
  description?: string;
  amount: number;
  dueDate?: Date;
  paymentId?: Types.ObjectId;
  status: IMilestoneStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export type IAssignmentStatus = "active" | "completed" | "cancelled";

export interface IJobAssignment {
  jobId: Types.ObjectId;
  freelancerId: Types.ObjectId | string;
  proposalId: Types.ObjectId;

  amount: number;

  tasks?: ITask[];

  milestones?: IMilestone[];

  status: IAssignmentStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobAssignmentDocument extends IJobAssignment, Document {
  _id: Types.ObjectId;
}