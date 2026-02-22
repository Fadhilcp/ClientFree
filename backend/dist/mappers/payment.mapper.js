"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPayment = mapPayment;
function mapPayment(payment) {
    return {
        id: payment._id.toString(),
        type: payment.type,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency ?? "",
        method: payment.method,
        provider: payment.provider,
        referenceId: payment.referenceId,
        providerPaymentId: payment.providerPaymentId,
        paymentDate: payment.paymentDate,
        withdrawalDate: payment.withdrawalDate,
        createdAt: payment.createdAt,
    };
}
