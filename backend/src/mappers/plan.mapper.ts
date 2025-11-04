import { IPlanDocument } from "types/plan.type";
import { PlanDTO } from "dtos/plan.dto";
import { FEATURE_LABELS } from "../constants/featureLabels";

export const mapPlan = (plan: IPlanDocument): PlanDTO => {

  const activeFeatures = Object.entries(plan.features)
    .filter(([_, value]) => !!value)
    .map(([key]) => FEATURE_LABELS[key] || key);

  return {
    id: plan._id.toString(),
    userType: plan.userType,
    planName: plan.planName,
    price: {
      monthly: plan.priceMonthly,
      yearly: plan.priceYearly,
      currency: plan.currency
    },
    features: activeFeatures,
    active: plan.active,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt
  };
};