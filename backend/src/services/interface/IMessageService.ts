import { MessageDTO } from "../../dtos/message.dto";

export interface IMessageService {
    sendMessage(
        chatId: string,
        senderId: string,
        type: "text" | "file" | "voice" | "video_call" | "voice_call",
        content?: string,
        file?: Express.Multer.File,
        callDetails?: any
    ): Promise<MessageDTO>;
    getChatMessages(chatId: string, userId: string): Promise<MessageDTO[]>;
    markMessageAsRead(chatId: string, userId: string): Promise<void>;
    getFileSignedUrl(messageId: string, userId: string): Promise<string>;
    deleteMessage(messageId: string, userId: string): Promise<MessageDTO>;
}