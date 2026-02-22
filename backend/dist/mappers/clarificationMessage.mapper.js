"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapClarificationMessage = mapClarificationMessage;
function mapClarificationMessage(msg) {
    const senderObj = msg.senderId;
    return {
        id: msg._id.toString(),
        boardId: msg.boardId.toString(),
        sender: {
            id: senderObj._id
                ? senderObj._id.toString()
                : msg.senderId.toString(),
            username: senderObj.username ?? "",
            name: senderObj.name ?? "",
            email: senderObj.email ?? "",
            profileImage: senderObj.profileImage ?? null,
            role: senderObj.role ?? "",
        },
        senderRole: msg.senderRole,
        message: msg.message,
        isDeleted: msg.isDeleted,
        deletedAt: msg.deletedAt ? msg.deletedAt.toISOString() : null,
        sentAt: msg.sentAt ? msg.sentAt.toISOString() : null,
        createdAt: msg.createdAt.toISOString(),
        updatedAt: msg.updatedAt.toISOString(),
    };
}
