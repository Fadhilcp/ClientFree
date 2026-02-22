"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const walletTransactionSchema = new mongoose_1.Schema({
    walletId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Wallet",
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobAssignmentId: { type: mongoose_1.Schema.Types.ObjectId, index: true },
    milestoneId: { type: mongoose_1.Schema.Types.ObjectId, index: true },
    subscriptionId: { type: mongoose_1.Schema.Types.ObjectId, index: true },
    paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Payment" },
    type: {
        type: String,
        enum: [
            "deposit",
            "escrow_hold",
            "escrow_release",
            "payment",
            "withdrawal",
            "refund",
            "fee",
            "admin_adjustment"
        ],
        required: true
    },
    direction: {
        type: String,
        enum: ["credit", "debit"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: { type: String, default: "INR" },
    balanceAfter: {
        available: { type: Number, required: true },
        escrow: { type: Number, required: true },
        pending: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "completed"
    },
}, { timestamps: true });
walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ paymentId: 1 });
walletTransactionSchema.index({ userId: 1 });
exports.default = (0, mongoose_1.model)('WalletTransaction', walletTransactionSchema);
