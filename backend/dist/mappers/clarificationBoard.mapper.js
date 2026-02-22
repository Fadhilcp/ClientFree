"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapClarificationBoard = mapClarificationBoard;
function mapClarificationBoard(board) {
    return {
        id: board._id.toString(),
        jobId: board.jobId.toString(),
        status: board.status,
        messageCount: board.messageCount,
        lastMessageAt: board.lastMessageAt
            ? board.lastMessageAt.toISOString()
            : null,
        isDeleted: board.isDeleted,
        deletedAt: board.deletedAt ? board.deletedAt.toISOString() : null,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
    };
}
