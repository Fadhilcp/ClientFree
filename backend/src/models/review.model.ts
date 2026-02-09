import { model, Schema } from "mongoose";
import { IReviewDocument } from "../types/review.type";

const reviewSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true,
    },
    reviewerId: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    revieweeId: {
        type: Schema.Types.ObjectId,
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
},{ timestamps: true });

reviewSchema.index(
    { jobId: 1, reviewerId: 1 },
    { unique: true }
);

export default model<IReviewDocument>("Review", reviewSchema);