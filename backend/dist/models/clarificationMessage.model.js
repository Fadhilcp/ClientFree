"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const clarificationMessageSchema = new mongoose_1.Schema({
    boardId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ClarificationBoard",
        required: true
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderRole: {
        type: String,
        enum: ["freelancer", "client"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('ClarificationMessage', clarificationMessageSchema);
