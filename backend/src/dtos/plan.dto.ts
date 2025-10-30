import { IPlan } from "types/plan.type";

export interface planDTO {
  id: string;
  userType: IPlan["userType"];
  planName: string;
  planCode: IPlan["planCode"];
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: string[];
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}