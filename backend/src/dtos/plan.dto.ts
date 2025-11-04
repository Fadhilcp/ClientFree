import { IPlan } from "types/plan.type";

export interface PlanDTO {
  id: string;
  userType: IPlan["userType"];
  planName: string;
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