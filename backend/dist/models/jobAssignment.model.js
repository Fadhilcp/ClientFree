"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const jobAssignmentSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Job", required: true },
    freelancerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    proposalId: { type: mongoose_1.Schema.Types.ObjectId, ref: "ProposalInvitation", required: true },
    amount: { type: Number, required: true },
    tasks: [{
            id: String,
            title: String,
            status: { type: String, enum: ["pending", "inProgress", "completed", "cancelled"], default: "pending" },
            dueDate: Date
        }],
    milestones: [{
            title: { type: String, required: true },
            description: String,
            amount: { type: Number, required: true },
            dueDate: Date,
            paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Payment" },
            status: {
                type: String,
                enum: ["draft", "funded", "submitted", "changes_requested", "approved", "released", "refund_processing", "refunded", "disputed", "cancelled"],
                default: "draft"
            },
            submissionMessage: { type: String },
            submissionFiles: [{
                    url: { type: String },
                    name: { type: String },
                    type: { type: String },
                    key: { type: String },
                }],
            submittedAt: Date,
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        }],
    status: {
        type: String,
        enum: ["pending", "active", "onHold", "completed", "cancelled"],
        default: "pending"
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('JobAssignment', jobAssignmentSchema);
