"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSubscription = void 0;
const mapSubscription = (doc) => ({
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
exports.mapSubscription = mapSubscription;
