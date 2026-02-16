import { Document, Types } from "mongoose";

export type ReviewRole = "client" | "freelancer";

export interface IReview {
  jobId: string | Types.ObjectId;

  reviewerId: Types.ObjectId;
  revieweeId: Types.ObjectId;

  reviewerRole: ReviewRole;
  revieweeRole: ReviewRole;

  rating: number;

  title?: string;
  comment?: string;

  isPublic: boolean;

  editedAt?: Date | null;
  reportedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {
  _id: Types.ObjectId;
}
