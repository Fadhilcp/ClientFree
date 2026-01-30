import { getIO } from "config/socket.config";
import { IMessageDocument } from "types/message.type";


export const emitMessageToChat = async(
    chatId: string,
    message: IMessageDocument
) => {
    const io = getIO();

    io.to(`chat:${chatId}`).emit("chat:message", {
        id: message._id.toString(),
        chatId: message.chatId.toString(),
        senderId: message.senderId.toString(),
        type: message.type,
        content: message.content,
        file: message.file,
        voice: message.voice,
        callDetails: message.callDetails,
        createdAt: message.createdAt?.toISOString(),
    });
}