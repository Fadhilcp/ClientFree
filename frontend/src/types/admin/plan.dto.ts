export interface PlanDTO {
  id: string;
  userType: "client" | "freelancer";
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