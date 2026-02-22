"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const proposalInvitationSchema = new mongoose_1.Schema({
    freelancerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    isInvitation: { type: Boolean, default: false },
    invitedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    invitation: {
        title: String,
        message: String,
        respondedAt: Date
    },
    bidAmount: Number,
    duration: String,
    description: String,
    milestones: [
        {
            title: { type: String, required: true },
            amount: { type: Number, required: true },
            dueDate: Date,
            description: String
        }
    ],
    upgradeStatus: {
        type: String,
        enum: ["none", "pending", "paid"],
        default: "none"
    },
    optionalUpgrade: {
        addonId: { type: mongoose_1.Schema.Types.ObjectId, ref: "AddOn" },
        name: { type: String, enum: ["highlight", "sponsored", "sealed"] },
        price: Number
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "invited", "shortlisted", "withdrawn"],
        default: "pending"
    }
}, { timestamps: true });
proposalInvitationSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("ProposalInvitation", proposalInvitationSchema);
