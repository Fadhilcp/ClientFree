"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    planId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
    },
    startDate: { type: Date },
    expiryDate: { type: Date },
    autoRenew: { type: Boolean, default: false },
    billingInterval: { type: String, enum: ["monthly", "yearly"], required: true },
    status: {
        type: String,
        enum: ["pending", "active", "expired", "cancelled"],
        default: "pending",
    },
    upgradeStatus: {
        type: String,
        enum: ["none", "pending"],
        default: "none",
    },
    gateway: {
        type: String,
        enum: ["razorpay", "stripe", "manual"],
        default: "razorpay",
    },
    customerId: { type: String },
    subscriptionId: { type: String },
    checkoutSessionId: { type: String, index: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Subscription', subscriptionSchema);
