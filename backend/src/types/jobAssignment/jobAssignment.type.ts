import { Document, Types } from "mongoose";
import { IJobDocument } from "../job.type";

export interface ITask {
  id?: string;
  title?: string;
  status?: "pending" | "inProgress" | "completed" | "cancelled";
  dueDate?: Date;
}

export type IMilestoneStatus = 
        | "draft"
        | "funded"
        | "submitted"
        | "changes_requested"
        | "approved"
        | "released"
        | "refund_processing"
        | "refunded"
        | "disputed"
        | "cancelled";

export interface IMilestoneFile {
  url: string;
  name: string;
  type: string;
  key: string
}

export interface IMilestone{
  _id?: Types.ObjectId;
  title: string;
  description?: string | null;
  amount: number;
  dueDate?: Date | null;
  paymentId?: Types.ObjectId | null;
  status: IMilestoneStatus;

  submissionMessage?: string | null;
  submissionFiles?: IMilestoneFile[];
  submittedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export type IAssignmentStatus = "active" | "pending" |"onHold" | "completed" | "cancelled"; 

export interface IJobAssignment {
  jobId: Types.ObjectId | string | IJobDocument;
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