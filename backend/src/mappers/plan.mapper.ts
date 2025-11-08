import { FEATURE_LABELS } from "constants/featureLabels";
import { PlanDetailUserDTO, PlanDetailAdminDTO, PlanTableDTO } from "dtos/plan.dto";
import { IPlanDocument } from "types/plan.type";

export function mapPlan(plan: IPlanDocument, detail: false): PlanTableDTO;
export function mapPlan(plan: IPlanDocument, detail: true, isAdmin: false): PlanDetailUserDTO;
export function mapPlan(plan: IPlanDocument, detail: true, isAdmin: boolean): PlanDetailAdminDTO;

export function mapPlan(
  plan: IPlanDocument,
  detail: boolean = false,
  isAdmin: boolean = false
): PlanTableDTO | PlanDetailUserDTO  {
  const base = {
    id: plan._id.toString(),
    userType: plan.userType,
    planName: plan.planName,
    price: {
      monthly: plan.priceMonthly,
      yearly: plan.priceYearly,
      currency: plan.currency,
    },
    active: plan.active,
    createdAt: plan.createdAt,
  };

  if (!detail) return base;

  if (isAdmin) {
    // for admin: full boolean feature object
    const allFeatures = Object.keys(FEATURE_LABELS).reduce((acc, key) => {
      acc[key] = !!plan.features?.[key];
      return acc;
    }, {} as Record<string, boolean>);

    return {
      ...base,
      features: allFeatures,
      updatedAt: plan.updatedAt,
    };
  }

  // for users: readable labels
  const activeFeatures = Object.entries(plan.features || {})
    .filter(([_, value]) => !!value)
    .map(([key]) => FEATURE_LABELS[key] || key);

  return {
    ...base,
    features: activeFeatures,
    updatedAt: plan.updatedAt,
  };
}
