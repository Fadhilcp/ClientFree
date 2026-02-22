"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const mongoose_1 = require("mongoose");
const chat_mapper_1 = require("../mappers/chat.mapper");
const chatBlockSocket_1 = require("../helpers/chatBlockSocket");
class ChatService {
    constructor(_chatRepository, _subscriptionService, _jobRepository) {
        this._chatRepository = _chatRepository;
        this._subscriptionService = _subscriptionService;
        this._jobRepository = _jobRepository;
    }
    ;
    async getOrCreateChat(initiatorId, receiverId, jobId) {
        if (initiatorId === receiverId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Cannot chat with yourself");
        }
        const participants = [
            new mongoose_1.Types.ObjectId(initiatorId),
            new mongoose_1.Types.ObjectId(receiverId),
        ];
        let chat = await this._chatRepository.findOne({
            participants: { $all: participants, $size: 2 },
        });
        if (!chat) {
            let canChat = false;
            if (jobId) {
                // job based permission
                canChat = true;
            }
            else {
                // subscription based permission
                const plan = await this._subscriptionService.getActiveFeatures(initiatorId);
                if (plan?.features.DirectMessaging) {
                    canChat = true;
                }
            }
            if (!canChat) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Chat not allowed without an active job or subscription");
            }
            chat = await this._chatRepository.create({
                participants,
                jobId: jobId ? new mongoose_1.Types.ObjectId(jobId) : null,
                status: "active",
            });
            return chat_mapper_1.ChatMapper.toDTO(chat);
        }
        // if job chat starts - attch job and unblock
        if (jobId) {
            await this._chatRepository.findByIdAndUpdate(chat._id.toString(), {
                jobId: new mongoose_1.Types.ObjectId(jobId),
                status: "active",
                blockReason: null,
            });
            return chat_mapper_1.ChatMapper.toDTO(chat);
        }
        const plan = await this._subscriptionService.getActiveFeatures(initiatorId);
        if (plan?.features.DirectMessaging) {
            // unblock if previously blocked
            if (chat.status === "blocked") {
                await this._chatRepository.findByIdAndUpdate(chat._id.toString(), {
                    status: "active",
                    blockReason: null,
                });
            }
            return chat_mapper_1.ChatMapper.toDTO(chat);
        }
        // still blocked
        throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Chat is blocked (job completed & no active subscription)");
    }
    async blockChat(chatId, reason) {
        const chat = await this._chatRepository.findById(chatId);
        if (!chat)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.CHAT_NOT_FOUND);
        chat.status = "blocked";
        chat.blockReason = reason;
        await chat.save();
        return chat_mapper_1.ChatMapper.toDTO(chat);
    }
    async getUserChats(userId, search) {
        const chats = await this._chatRepository.findUserChatsWithSearch(userId, search);
        return chat_mapper_1.ChatMapper.toListDTOList(chats, userId);
    }
    // method to check block status by jobId
    async updateBlockStatusByJobId(jobId) {
        const chat = await this._chatRepository.findOne({ jobId });
        // silent return
        if (!chat)
            return;
        await this._recalculateAndPersistBlockStatus(chat);
    }
    async updateBlockStatus(chatId) {
        const chat = await this._chatRepository.findById(chatId);
        if (!chat)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.CHAT_NOT_FOUND);
        const updatedChat = await this._recalculateAndPersistBlockStatus(chat);
        return chat_mapper_1.ChatMapper.toDTO(updatedChat);
    }
    // helper method - to check update chat is blocked or not
    async _recalculateAndPersistBlockStatus(chat) {
        const prevBlocked = chat.isBlocked;
        const hasActiveJob = await this._jobRepository.exists({
            _id: chat.jobId,
            status: { $in: ["open", "active"] },
        });
        // any of them or both has direct messaging feature
        const [participantOne, participantTwo] = await Promise.all([
            this._subscriptionService.getActiveFeatures(chat.participants[0].toString()),
            this._subscriptionService.getActiveFeatures(chat.participants[1].toString()),
        ]);
        const hasActiveSubscription = Boolean(participantOne?.features.DirectMessaging) ||
            Boolean(participantTwo?.features.DirectMessaging);
        if (!hasActiveJob && !hasActiveSubscription) {
            chat.isBlocked = true;
            chat.blockReason = hasActiveJob
                ? null
                : "subscription_expired";
        }
        else {
            chat.isBlocked = false;
            chat.blockReason = null;
        }
        await chat.save();
        if (prevBlocked !== chat.isBlocked) {
            (0, chatBlockSocket_1.emitChatBlocked)(chat.id, {
                isBlocked: chat.isBlocked,
                blockReason: chat.blockReason,
            });
        }
        return chat;
    }
}
exports.ChatService = ChatService;
