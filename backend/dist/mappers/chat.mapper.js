"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMapper = void 0;
class ChatMapper {
    static toDTO(chat) {
        return {
            id: chat._id.toString(),
            jobId: chat.jobId ? chat.jobId.toString() : null,
            participants: chat.participants.map(p => p.toString()),
            status: chat.status,
            isBlocked: chat.isBlocked,
            blockReason: chat.blockReason ?? null,
            lastMessageAt: chat.lastMessageAt?.toISOString(),
            createdAt: chat.createdAt.toISOString(),
            updatedAt: chat.updatedAt.toISOString(),
        };
    }
    static toListDTO(chat, currentUserId) {
        const participants = chat.participants;
        const otherUser = participants.find(p => p._id.toString() !== currentUserId);
        if (!otherUser) {
            throw new Error("ChatMapper: otherUser not found");
        }
        const job = chat.jobId
            ? chat.jobId
            : null;
        return {
            id: chat._id.toString(),
            job: job
                ? {
                    id: job._id.toString(),
                    title: job.title,
                    status: job.status,
                }
                : null,
            otherUser: {
                id: otherUser._id.toString(),
                name: otherUser.name ?? "",
                username: otherUser.username,
                profileImage: otherUser.profileImage ?? "",
                role: otherUser.role,
                isVerified: otherUser.isVerified ?? false,
            },
            status: chat.status,
            isBlocked: chat.isBlocked,
            blockReason: chat.blockReason ?? null,
            lastMessageAt: chat.lastMessageAt?.toISOString(),
            createdAt: chat.createdAt.toISOString(),
            updatedAt: chat.updatedAt.toISOString(),
        };
    }
    static toListDTOList(chats, currentUserId) {
        return chats.map(chat => this.toListDTO(chat, currentUserId));
    }
}
exports.ChatMapper = ChatMapper;
