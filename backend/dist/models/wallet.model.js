"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const walletSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    role: {
        type: String,
        enum: ["client", "freelancer", "admin"],
        required: true
    },
    balance: {
        available: { type: Number, default: 0 },
        escrow: { type: Number, default: 0 },
        pending: { type: Number, default: 0 }
    },
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active"
    }
}, { timestamps: true });
walletSchema.index({ userId: 1 });
exports.default = (0, mongoose_1.model)('Wallet', walletSchema);
