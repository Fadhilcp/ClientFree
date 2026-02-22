import { ISubscriptionDocument } from "../types/subscription.type";
import { UserSubscriptionsDTO } from "../dtos/userSubscriptions.dto";
import { IPlanDocument } from "../types/plan.type";

export function mapUserSubscriptions(
  subscription: ISubscriptionDocument
): UserSubscriptionsDTO {
    // for populate
    const planObj = subscription.planId as unknown as Partial<IPlanDocument>;

    const plan = subscription.planId;

    const amount =
        subscription.billingInterval === "monthly"
        ? planObj?.priceMonthly ?? 0
        : planObj?.priceYearly ?? 0;

    return {
        id: subscription._id.toString(),
        subscriptionId: subscription.subscriptionId ?? null,

        planId: plan?._id?.toString() ?? planObj._id?.toString(),
        planName: planObj?.planName ?? "Deleted Plan",
        userType: planObj?.userType ?? "freelancer",

        billingInterval: subscription.billingInterval,
        status: subscription.status,

        amount,
        currency: "INR",

        startDate: subscription.startDate ?? null,
        expiryDate: subscription.expiryDate ?? null,

        createdAt: subscription.createdAt,
    };
}
