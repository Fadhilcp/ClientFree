export interface IMessageService {
    sendMessage(
        chatId: string,
        senderId: string,
        type: "text" | "file" | "voice" | "video_call" | "voice_call",
        content?: string,
        file?: any,
        callDetails?: any
    ): Promise<any>;
    getChatMessages(chatId: string, userId: string): Promise<any>;
    markMessageAsRead(chatId: string, userId: string): Promise<any>;
}