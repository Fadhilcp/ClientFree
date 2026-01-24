import { Document, Types } from "mongoose";

export type ChatType = "job" | "subscription";

export type ChatStatus = "active" | "closed" | "blocked";

export type ChatBlockReason =
  | "job_completed"
  | "manual"
  | "policy";

export interface IChat {

  jobId: Types.ObjectId | string | null;

  participants: (Types.ObjectId | string)[];

  status: ChatStatus;

  blockReason?: ChatBlockReason | null;

  lastMessageAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatDocument extends IChat, Document {
  _id: Types.ObjectId;
}
