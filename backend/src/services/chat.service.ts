import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { IChatService } from "./interface/IChatService";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { FilterQuery, Types } from "mongoose";
import { ISubscriptionService } from "./interface/ISubscriptionService";
import { ChatMapper } from "../mappers/chat.mapper";
import { ChatDTO, ChatListDTO } from "../dtos/chat.dto";
import { IJobRepository } from "../repositories/interfaces/IJobRepository";
import { emitChatBlocked } from "../helpers/chatBlockSocket";
import { IChatDocument } from "../types/chat.type";

export class ChatService implements IChatService {
    constructor(
        private _chatRepository: IChatRepository,
        private _subscriptionService: ISubscriptionService,
        private _jobRepository: IJobRepository,
    ){};

    async getOrCreateChat(initiatorId: string, receiverId: string, jobId?: string): Promise<ChatDTO> {

        if (initiatorId === receiverId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Cannot chat with yourself");
        }

        const participants = [
            new Types.ObjectId(initiatorId),
            new Types.ObjectId(receiverId),
        ];

        let chat = await this._chatRepository.findOne({
            participants: { $all: participants, $size: 2 },
        });

        if (!chat) {
            let canChat = false;

            if (jobId) {
                // job based permission
                canChat = true;
            } else {
                // subscription based permission
                const plan = await this._subscriptionService.getActiveFeatures(initiatorId);
                if (plan?.features.DirectMessaging) {
                    canChat = true;
                }
            }

            if (!canChat) {
                throw createHttpError(
                    HttpStatus.FORBIDDEN,
                    "Chat not allowed without an active job or subscription"
                );
            }

            chat = await this._chatRepository.create({
                participants,
                jobId: jobId ? new Types.ObjectId(jobId) : null,
                status: "active",
            });

            return ChatMapper.toDTO(chat);
        }
        // if job chat starts - attch job and unblock
        if (jobId) {
            await this._chatRepository.findByIdAndUpdate(chat._id.toString(), {
                jobId: new Types.ObjectId(jobId),
                status: "active",
                blockReason: null,
            });

            return ChatMapper.toDTO(chat);
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
            return ChatMapper.toDTO(chat);
        }

        // still blocked
        throw createHttpError(
            HttpStatus.FORBIDDEN,
            "Chat is blocked (job completed & no active subscription)"
        );
    }

    async blockChat(chatId: string, reason: "job_completed" | "manual" | "subscription_expired"): Promise<ChatDTO> {
        
        const chat = await this._chatRepository.findById(chatId);
        if(!chat) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CHAT_NOT_FOUND);

        chat.status = "blocked";
        chat.blockReason = reason;
        await chat.save();

        return ChatMapper.toDTO(chat);
    }

    async getUserChats(userId: string, search: string): Promise<ChatListDTO[]> {

        const chats = await this._chatRepository.findUserChatsWithSearch(userId, search);

        return ChatMapper.toListDTOList(chats, userId);
    }


    // method to check block status by jobId
    async updateBlockStatusByJobId(jobId: string): Promise<void> {
        const chat = await this._chatRepository.findOne({ jobId });
        // silent return
        if(!chat) return;

        await this._recalculateAndPersistBlockStatus(chat);
    }

    async updateBlockStatus(chatId: string): Promise<ChatDTO> {
        const chat = await this._chatRepository.findById(chatId);
        if(!chat) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CHAT_NOT_FOUND);

        const updatedChat = await this._recalculateAndPersistBlockStatus(chat);
        return ChatMapper.toDTO(updatedChat);
    }
    
    // helper method - to check update chat is blocked or not
    private async _recalculateAndPersistBlockStatus(chat: IChatDocument): Promise<IChatDocument> {

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

        const hasActiveSubscription = 
            Boolean(participantOne?.features.DirectMessaging) || 
            Boolean(participantTwo?.features.DirectMessaging);

        if (!hasActiveJob && !hasActiveSubscription) {
            chat.isBlocked = true;
            chat.blockReason = hasActiveJob
                ? null
                : "subscription_expired";
        } else {
            chat.isBlocked = false;
            chat.blockReason = null;
        }

        await chat.save();

        if (prevBlocked !== chat.isBlocked) {
            emitChatBlocked(chat.id, {
                isBlocked: chat.isBlocked,
                blockReason: chat.blockReason,
            });
        }

        return chat;
    }
}