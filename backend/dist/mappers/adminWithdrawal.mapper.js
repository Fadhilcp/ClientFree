"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapAdminWithdrawal = mapAdminWithdrawal;
function mapAdminWithdrawal(payment) {
    const userDoc = payment.userId;
    const userId = userDoc?._id?.toString() ??
        (typeof payment.userId === "string"
            ? payment.userId
            : payment.userId?.toString());
    if (!userId) {
        throw new Error("Payment userId is missing");
    }
    return {
        id: payment._id.toString(),
        amount: payment.amount,
        currency: payment.currency ?? "",
        status: payment.status,
        provider: payment.provider ?? "",
        method: payment.method,
        referenceId: payment.referenceId,
        providerPaymentId: payment.providerPaymentId,
        requestedAt: payment.createdAt,
        processedAt: payment.withdrawalDate,
        user: {
            id: userId,
            name: userDoc?.name ?? "",
            email: userDoc?.email ?? "",
            role: userDoc?.role ?? "",
        },
    };
}
