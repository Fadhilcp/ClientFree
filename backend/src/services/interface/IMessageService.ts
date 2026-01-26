import { MessageDTO } from "dtos/message.dto";

export interface IMessageService {
    sendMessage(
        chatId: string,
        senderId: string,
        type: "text" | "file" | "voice" | "video_call" | "voice_call",
        content?: string,
        file?: any,
        callDetails?: any
    ): Promise<MessageDTO>;
    getChatMessages(chatId: string, userId: string): Promise<MessageDTO[]>;
    markMessageAsRead(chatId: string, userId: string): Promise<void>;
}