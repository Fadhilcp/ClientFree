import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { IMessageService } from "./interface/IMessageService";
import { IMessageRepository } from "../repositories/interfaces/IMessageRepository";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { emitMessageToChat } from "../helpers/messageSocket";
import { MessageMapper } from "../mappers/message.mapper";
import { MessageDTO } from "../dtos/message.dto";
import { uploadToCloudinary } from "../utils/cloudinary.helper";
import s3 from "../config/s3.config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.config";
import { generateSignedUrl } from "../utils/getSignedUrl.util";
import { emitMessageDeleted } from "../helpers/messageDeleteSocket";
import { emitChatLastMessage } from "../sockets/chatList.socket";

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
        file?: Express.Multer.File,
        callDetails?: any
    ): Promise<MessageDTO> {
        const chat = await this._chatRepository.findById(chatId);
        if (!chat) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CHAT_NOT_FOUND);

        if (!chat.participants.some(id => id.toString() === senderId)) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "User is not a participant of this chat");
        }

        if (chat.status !== "active") {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Chat is not active");
        }

        let fileMeta: any = undefined;

        // MEDIA HANDLING
        if ((type === "voice" || type === "file") && file) {

            if (type === "voice") {
                const result = await uploadToCloudinary(file, {
                    resource_type: "video",
                    folder: "chat/voice",
                });

                fileMeta = {
                    url: result.secure_url,
                    duration: result.duration,
                };
            }

            if (type === "file") {

                if (file.mimetype.startsWith("image/")) {
                    const result = await uploadToCloudinary(file, {
                        folder: "chat/images",
                    });

                    fileMeta = {
                        url: result.secure_url,
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                    };
                } else {
                    const key = `chat/files/${Date.now()}-${file.originalname}`;
        
                    await s3.send(
                        new PutObjectCommand({
                            Bucket: env.AWS_BUCKET!,
                            Key: key,
                            Body: file.buffer,
                            ContentType: file.mimetype,
                            ACL: "private",
                        })
                    );

                    fileMeta = {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                        key,
                    };
                }
            }
        }

        const messagePayload: any = {
            chatId,
            senderId,
            type,
            content,
            callDetails,
            isReadBy: [senderId],
        };

        if (type === "voice") {
            messagePayload.voice = fileMeta;
        }

        if (type === "file") {
            messagePayload.file = fileMeta;
        }

        const message = await this._messageRepository.create(messagePayload);

        chat.lastMessageAt = new Date();
        await chat.save();

        await emitMessageToChat(chatId, message);

        emitChatLastMessage(
            chatId,
            chat.participants.map(id => id.toString()),
            chat.lastMessageAt
        );

        return MessageMapper.toDTO(message);
    }

    async getChatMessages(chatId: string, userId: string): Promise<MessageDTO[]> {
        const chat = await this._chatRepository.findById(chatId);
        if(!chat) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CHAT_NOT_FOUND);

        if(!chat.participants.some(id => id.toString() === userId)) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.ACCESS_DENIED);
        }

        const message = await this._messageRepository.find(
            { chatId },
            { sort: { createdAt: 1 }}
        );

        return MessageMapper.toDTOList(message);
    }

    async markMessageAsRead(chatId: string, userId: string): Promise<void> {
        
        await this._messageRepository.updateMany(
            { chatId, isReadBy: { $ne: userId }},
            { $push: { isReadBy: userId }}
        );
    }

    async getFileSignedUrl(messageId: string, userId: string): Promise<string> {

        const message = await this._messageRepository.findById(messageId);

        if (!message) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Message not found");
        }

        if (message.type !== "file" || !message.file?.key) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Message has no file");
        }

        const chat = await this._chatRepository.findById(message.chatId.toString());
        if (!chat) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CHAT_NOT_FOUND);
        }

        if (!chat.participants.some(id => id.toString() === userId)) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.ACCESS_DENIED);
        }

        return generateSignedUrl(message.file.key);
    }

    async deleteMessage(messageId: string, userId: string): Promise<MessageDTO> {

        const message = await this._messageRepository.findById(messageId);
        if (!message)
            throw createHttpError(HttpStatus.NOT_FOUND, "Message not found");

        if (message.senderId.toString() !== userId) {
            throw createHttpError(HttpStatus.FORBIDDEN, "Not allowed");
        }

        if (message.isDeleted) {
            return MessageMapper.toDTO(message);
        }

        message.isDeleted = true;
        message.deletedAt = new Date();

        await message.save();
        // socket
        emitMessageDeleted(message.chatId.toString(), message._id.toString());

        return MessageMapper.toDTO(message);
    }
}