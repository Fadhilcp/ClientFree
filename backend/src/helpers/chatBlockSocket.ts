import { getIO } from "../config/socket.config";

export function emitChatBlocked(
    chatId: string,
    payload: { isBlocked: boolean; blockReason: string | null }
) {
    const io = getIO();

    io.to(`chat:${chatId}`).emit("chat:block-status", payload);
}