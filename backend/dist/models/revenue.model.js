"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const revenueSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['commission', 'subscription', 'addOn'],
        required: true
    },
    source: {
        type: String,
        enum: ['freelancer', 'client'],
        required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    referencePaymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Payments" },
    referenceId: { type: mongoose_1.Schema.Types.ObjectId }, // planId, jobId, milestoneId, addOnId
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoices' },
    method: { type: String }, // card, wallet, razorpay, stripe, paypal etc
    provider: { type: String }, // razorpay, stripe, paypal etc
    providerPaymentId: { type: String },
    gatewayFee: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'completed', 'refunded', 'failed'],
        default: 'completed'
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Revenue', revenueSchema);
