"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const otpUserStoreSchema = new mongoose_1.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
    },
    otp: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        enum: ['signup', 'forgot-password', 'email-change', 'phone-change'],
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    newEmail: {
        type: String
    },
    newPhone: {
        type: String
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('OtpUserStore', otpUserStoreSchema);
