"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatSchema = new mongoose_1.Schema({
    participants: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Job',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'blocked'],
        default: 'active'
    },
    blockReason: {
        type: String,
        enum: ['job_completed', 'subscription_expired', 'manual']
    },
    lastMessageAt: Date,
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Chat", chatSchema);
