import { getIO } from "../config/socket.config";

export const emitChatLastMessage = (
    chatId: string,
    participants: string[],
    lastMessageAt: Date
) => {
    const io = getIO();

    participants.forEach(userId => {
        io.to(`user:${userId}`).emit("chat:last-message", {
            chatId,
            lastMessageAt,
        });
    });
};