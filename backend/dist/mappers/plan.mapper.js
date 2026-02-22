"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPlan = mapPlan;
const featureLabels_1 = require("../constants/featureLabels");
function mapPlan(plan, detail = false, isAdmin = false) {
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
    if (!detail)
        return base;
    if (isAdmin) {
        // for admin: full boolean feature object
        const allFeatures = Object.keys(featureLabels_1.FEATURE_LABELS).reduce((acc, key) => {
            acc[key] = Boolean(plan.features?.[key]);
            return acc;
        }, {});
        return {
            ...base,
            features: allFeatures,
            updatedAt: plan.updatedAt,
        };
    }
    // for users: readable labels
    const activeFeatures = Object.entries(plan.features || {})
        .filter(([_, value]) => !!value)
        .map(([key]) => {
        const featureKey = key;
        return featureLabels_1.FEATURE_LABELS[featureKey];
    });
    return {
        ...base,
        features: activeFeatures,
        updatedAt: plan.updatedAt,
    };
}
