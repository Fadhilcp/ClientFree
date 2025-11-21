import { Document, Types } from "mongoose";

export interface IPayment {
  budget?: number;
  type?: "fixed" | "hourly";
}

export interface ILocationPreference {
  city?: string;
  country?: string;
  type?: "specific" | "worldwide";
}

export interface IJob {
  clientId: Types.ObjectId;

  title: string;
  category?: string;
  subcategory?: string;

  skills?: string[];

  duration?: string;

  payment?: IPayment;

  description?: string;

  visibility: "public" | "private";

  locationPreference?: ILocationPreference;

  status: "open" | "active" | "completed" | "cancelled";

  proposalCount: number;

  proposals: Types.ObjectId[];

  isFeatured: boolean;
  isMultiFreelancer: boolean;

  acceptedProposalIds: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobDocument extends IJob, Document {
  _id: Types.ObjectId;
}