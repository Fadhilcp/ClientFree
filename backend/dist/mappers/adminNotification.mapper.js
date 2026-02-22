"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapNotification = void 0;
const mapNotification = (doc) => {
    return {
        id: doc._id.toString(),
        scope: doc.scope,
        roles: doc.roles ?? [],
        userIds: doc.userIds?.map(id => id.toString()) ?? [],
        category: doc.category,
        subject: doc.subject,
        message: doc.message,
        sendAs: doc.sendAs,
        createdBy: doc.createdBy?.toString() ?? null,
        createdAt: doc.createdAt?.toISOString() ?? null,
        isDeleted: doc.isDeleted,
        deletedAt: doc.deletedAt?.toISOString() ?? null
    };
};
exports.mapNotification = mapNotification;
