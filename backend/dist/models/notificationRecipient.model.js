"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notificationRecipientSchema = new mongoose_1.Schema({
    notificationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Notification',
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    deliveredViaSocket: {
        type: Boolean,
        default: false
    },
    deliveredViaEmail: {
        type: Boolean,
        default: false
    },
    readAt: { type: Date },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('NotificationRecipient', notificationRecipientSchema);
