import { IChatRepository } from "repositories/interfaces/IChatRepository";
import { IMessageService } from "./interface/IMessageService";
import { IMessageRepository } from "repositories/interfaces/IMessageRepository";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { emitMessageToChat } from "helpers/messageSocket";

export class MessageService implements IMessageService {
    constructor(
        private _chatRepository: IChatRepository,
        private _messageRepository: IMessageRepository
    ){};

    async sendMessage(
        chatId: string, 
        senderId: string, 
        type: "text" | "file" | "voice" | "video_call" | "voice_call", 
        content?: string, 
        file?: any, 
        callDetails?: any
    ): Promise<any> {
        const chat = await this._chatRepository.findById(chatId);
        if (!chat) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CHAT_NOT_FOUND);

        if (!chat.participants.some(id => id.toString() === senderId)) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "User is not a participant of this chat");
        }

        if (chat.status !== "active") {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Chat is not active");
        }

        const message = await this._messageRepository.create({
            chatId,
            senderId,
            type,
            content,
            file,
            callDetails,
            isReadBy: [senderId], 
        });

        chat.lastMessageAt = new Date();
        await chat.save();

        await emitMessageToChat(chatId, message);

        return message;
    }

    async getChatMessages(chatId: string, userId: string): Promise<any> {
        const chat = await this._chatRepository.findById(chatId);
        if(!chat) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CHAT_NOT_FOUND);

        if(!chat.participants.some(id => id.toString() === userId)) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.ACCESS_DENIED);
        }

        const message = await this._messageRepository.find(
            { chatId, isDeleted: false, },
            { sort: { createdAt: 1 }}
        );

        return message;
    }

    async markMessageAsRead(chatId: string, userId: string): Promise<any> {
        
        await this._messageRepository.updateMany(
            { chatId, isReadBy: { $ne: userId }},
            { $push: { isReadBy: userId }}
        );
    }
}