
interface BasePlanDTO {
  id: string;
  planName: string;
  userType: 'client' | 'freelancer';
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  active: boolean;
}

export interface PlanTableDTO extends BasePlanDTO {
  createdAt?: string;
}

export interface PlanDetailDTO extends BasePlanDTO {
  features: string[];
  createdAt: string;
  updatedAt: string;
}