"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapWalletTransaction = mapWalletTransaction;
function mapWalletTransaction(transaction) {
    return {
        id: transaction._id.toString(),
        type: transaction.type,
        direction: transaction.direction,
        amount: transaction.amount,
        currency: transaction.currency,
        balanceAfter: transaction.balanceAfter,
        paymentId: transaction.paymentId?.toString(),
        status: transaction.status,
        createdAt: transaction.createdAt,
    };
}
