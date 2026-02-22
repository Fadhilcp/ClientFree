"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const JobSchema = new mongoose_1.Schema({
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: { type: String, required: true },
    category: String,
    subcategory: String,
    skills: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Skill" }],
    duration: String,
    payment: {
        budget: Number,
        type: { type: String, enum: ["fixed", "hourly"] }
    },
    description: String,
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    locationPreference: {
        city: String,
        country: String,
        type: { type: String, enum: ["specific", "worldwide"] }
    },
    status: {
        type: String,
        enum: ["open", "active", "completed", "cancelled"],
        default: "open"
    },
    proposalCount: { type: Number, default: 0 },
    proposals: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "ProposalInvitation" }
    ],
    isFeatured: { type: Boolean, default: false },
    isMultiFreelancer: { type: Boolean, default: false },
    acceptedProposalIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "ProposalInvitation" }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Job", JobSchema);
