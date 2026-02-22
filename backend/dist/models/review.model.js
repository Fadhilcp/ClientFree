"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true,
    },
    reviewerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    revieweeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true,
    },
    reviewerRole: {
        type: String,
        enum: ["client", "freelancer"],
        required: true,
    },
    revieweeRole: {
        type: String,
        enum: ["client", "freelancer"],
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    title: {
        type: String,
        maxlength: 100,
    },
    comment: {
        type: String,
        maxlength: 2000,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    editedAt: {
        type: Date,
        default: null,
    },
    reportedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });
reviewSchema.index({ jobId: 1, reviewerId: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("Review", reviewSchema);
