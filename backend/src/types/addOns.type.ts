import { Document, Types } from "mongoose";

export type AddOnCategory = "bid" | "job" | "profile";
export type AddOnUserType = "freelancer" | "client" | "both";

export interface IAddOnFlags {
  highlight?: boolean;
  sealed?: boolean;
  sponsored?: boolean;
}

export interface IAddOn {
  key: string;
  displayName: string;
  description?: string;

  category: AddOnCategory;

  price: number;

  userType: AddOnUserType;

  flags: IAddOnFlags;

  sortOrder: number;

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddOnDocument extends IAddOn, Document {
  _id: Types.ObjectId;
}