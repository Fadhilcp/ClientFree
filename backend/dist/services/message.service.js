"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const messageSocket_1 = require("../helpers/messageSocket");
const message_mapper_1 = require("../mappers/message.mapper");
const cloudinary_helper_1 = require("../utils/cloudinary.helper");
const s3_config_1 = __importDefault(require("../config/s3.config"));
const client_s3_1 = require("@aws-sdk/client-s3");
const env_config_1 = require("../config/env.config");
const getSignedUrl_util_1 = require("../utils/getSignedUrl.util");
const messageDeleteSocket_1 = require("../helpers/messageDeleteSocket");
class MessageService {
    constructor(_chatRepository, _messageRepository) {
        this._chatRepository = _chatRepository;
        this._messageRepository = _messageRepository;
    }
    ;
    async sendMessage(chatId, senderId, type, content, file, callDetails) {
        const chat = await this._chatRepository.findById(chatId);
        if (!chat)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.CHAT_NOT_FOUND);
        if (!chat.participants.some(id => id.toString() === senderId)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "User is not a participant of this chat");
        }
        if (chat.status !== "active") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Chat is not active");
        }
        let fileMeta = undefined;
        // MEDIA HANDLING
        if ((type === "voice" || type === "file") && file) {
            if (type === "voice") {
                const result = await (0, cloudinary_helper_1.uploadToCloudinary)(file, {
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
                    const result = await (0, cloudinary_helper_1.uploadToCloudinary)(file, {
                        folder: "chat/images",
                    });
                    fileMeta = {
                        url: result.secure_url,
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                    };
                }
                else {
                    const key = `chat/files/${Date.now()}-${file.originalname}`;
                    await s3_config_1.default.send(new client_s3_1.PutObjectCommand({
                        Bucket: env_config_1.env.AWS_BUCKET,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                        ACL: "private",
                    }));
                    fileMeta = {
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype,
                        key,
                    };
                }
            }
        }
        const messagePayload = {
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
        await (0, messageSocket_1.emitMessageToChat)(chatId, message);
        return message_mapper_1.MessageMapper.toDTO(message);
    }
    async getChatMessages(chatId, userId) {
        const chat = await this._chatRepository.findById(chatId);
        if (!chat)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.CHAT_NOT_FOUND);
        if (!chat.participants.some(id => id.toString() === userId)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.ACCESS_DENIED);
        }
        const message = await this._messageRepository.find({ chatId }, { sort: { createdAt: 1 } });
        return message_mapper_1.MessageMapper.toDTOList(message);
    }
    async markMessageAsRead(chatId, userId) {
        await this._messageRepository.updateMany({ chatId, isReadBy: { $ne: userId } }, { $push: { isReadBy: userId } });
    }
    async getFileSignedUrl(messageId, userId) {
        const message = await this._messageRepository.findById(messageId);
        if (!message) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Message not found");
        }
        if (message.type !== "file" || !message.file?.key) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Message has no file");
        }
        const chat = await this._chatRepository.findById(message.chatId.toString());
        if (!chat) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.CHAT_NOT_FOUND);
        }
        if (!chat.participants.some(id => id.toString() === userId)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.ACCESS_DENIED);
        }
        return (0, getSignedUrl_util_1.generateSignedUrl)(message.file.key);
    }
    async deleteMessage(messageId, userId) {
        const message = await this._messageRepository.findById(messageId);
        if (!message)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Message not found");
        if (message.senderId.toString() !== userId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Not allowed");
        }
        if (message.isDeleted) {
            return message_mapper_1.MessageMapper.toDTO(message);
        }
        message.isDeleted = true;
        message.deletedAt = new Date();
        await message.save();
        // socket
        (0, messageDeleteSocket_1.emitMessageDeleted)(message.chatId.toString(), message._id.toString());
        return message_mapper_1.MessageMapper.toDTO(message);
    }
}
exports.MessageService = MessageService;
