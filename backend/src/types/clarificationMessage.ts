import { Document, Types } from "mongoose";

export interface IClarificationMessage {
  boardId: Types.ObjectId;

  senderId: Types.ObjectId | string;
  senderRole: "freelancer" | "client";

  message: string;

  isDeleted?: boolean;
  deletedAt?: Date;

  sentAt?: Date;
}

export interface IClarificationMessageDocument
  extends IClarificationMessage, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}