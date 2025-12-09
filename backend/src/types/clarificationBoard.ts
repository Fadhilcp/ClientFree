import { Document, Types } from "mongoose";

export interface IClarificationBoard {
  jobId: Types.ObjectId;

  status: "open" | "closed";

  messageCount: number;

  lastMessageAt?: Date;

  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface IClarificationBoardDocument
  extends IClarificationBoard, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}