import { IPlan } from "types/plan.type";

interface BasePlanDTO {
  id: string;
  planName: string;
  userType: IPlan["userType"];
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  active: boolean;
}

export interface PlanTableDTO extends BasePlanDTO {
  createdAt?: Date;
}

export interface PlanDetailUserDTO extends BasePlanDTO {
  features: Record<string, boolean> | string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanDetailAdminDTO extends PlanTableDTO {
  features: Record<string, boolean>; 
  updatedAt: Date;
}