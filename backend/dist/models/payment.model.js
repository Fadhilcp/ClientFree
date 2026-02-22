"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: [
            'escrow',
            'milestone',
            'fullPayment',
            'refund',
            'withdrawal',
            'subscription',
            'addon',
        ],
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending',
            'processing',
            'completed',
            'released',
            'refund_processing',
            'refunded',
            'cancelled',
            'failed'
        ],
        default: 'pending'
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String }, // razorpay, wallet, stripe, paypal, bank
    provider: { type: String, default: "razorpay" },
    // Razorpay / Stripe fields
    providerPaymentId: { type: String },
    providerOrderId: { type: String },
    providerSignature: { type: String },
    stripeAccountId: { type: String },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job' },
    milestoneId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Milestones' },
    proposalId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Proposal" },
    freelancerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, // initiator
    isDisputed: { type: Boolean, default: false },
    disputeReason: { type: String },
    adminNotes: { type: String },
    // financial tracking
    platformFee: { type: Number, default: 0 },
    paymentGatewayFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    refundReason: { type: String },
    paymentDate: { type: Date },
    escrowReleaseDate: { type: Date },
    refundDate: { type: Date },
    withdrawalDate: { type: Date },
    referenceId: { type: String },
    // soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Payment', paymentSchema);
