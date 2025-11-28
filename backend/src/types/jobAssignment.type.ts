import { Document, Types } from "mongoose";
import { IJobDocument } from "./job.type";

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
        | "refunded"
        | "disputed"
        | "cancelled";


export interface IMilestone{
  _id?: Types.ObjectId;
  title: string;
  description?: string | null;
  amount: number;
  dueDate?: Date | null;
  paymentId?: Types.ObjectId | null;
  status: IMilestoneStatus;

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