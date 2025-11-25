import { Document, Types } from "mongoose";
import { IProposalInvitationDocument } from "./proposalInvitation.type";

export interface IPayment {
  budget?: number;
  type?: "fixed" | "hourly";
}

export interface ILocationPreference {
  city?: string;
  country?: string;
  type?: "specific" | "worldwide";
}

export type IJobStatus = "open" | "active" | "completed" | "cancelled";

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

  status: IJobStatus;

  proposalCount: number;

  proposals: Types.ObjectId[];

  isFeatured: boolean;
  isMultiFreelancer: boolean;

  acceptedProposalIds: Types.ObjectId[] | IProposalInvitationDocument[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobDocument extends IJob, Document {
  _id: Types.ObjectId;
}