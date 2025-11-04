import { SubscriptionDto } from "dtos/subscription.dto";
import { ISubscriptionDocument } from "types/subscription.type";

export const mapSubscription = (doc: ISubscriptionDocument): SubscriptionDto => ({
  id: doc._id.toString(),
  userId: doc.userId?.toString() ?? null,
  planId: doc.planId?.toString() ?? null,
  status: doc.status,
  startDate: doc.startDate ?? null,
  expiryDate: doc.expiryDate ?? null,
  autoRenew: doc.autoRenew,
  gateway: doc.gateway,
  customerId: doc.customerId ?? null,
  subscriptionId: doc.subscriptionId ?? null,
  createdAt: doc.createdAt ?? null,
  updatedAt: doc.updatedAt ?? null,
});