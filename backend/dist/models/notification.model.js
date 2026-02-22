"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    scope: {
        type: String,
        enum: ['global', 'role', 'users'],
        required: true
    },
    roles: [{
            type: String,
            enum: ['client', 'freelancer', 'admin']
        }], // used when scope = 'role'
    userIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }], // used when scope = 'users'
    category: {
        type: String,
        enum: [
            'job_posted',
            'proposal_received',
            'proposal_accepted',
            'payment',
            'admin_announcement',
            'system'
        ],
        required: true
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    sendAs: {
        type: String,
        enum: ['in-app', 'email', 'both'],
        default: 'in-app'
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User' // admin or system
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Notification', notificationSchema);
