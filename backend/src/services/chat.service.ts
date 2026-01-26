import { IChatRepository } from "repositories/interfaces/IChatRepository";
import { IChatService } from "./interface/IChatService";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { Types } from "mongoose";
import { ISubscriptionService } from "./interface/ISubscriptionService";
import { ChatMapper } from "mappers/chat.mapper";
import { ChatDTO } from "dtos/chat.dto";

export class ChatService implements IChatService {
    constructor(
        private _chatRepository: IChatRepository,
        private _subscriptionService: ISubscriptionService
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

    async blockChat(chatId: string, reason: "job_completed" | "manual" | "policy"): Promise<ChatDTO> {
        
        const chat = await this._chatRepository.findById(chatId);
        if(!chat) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CHAT_NOT_FOUND);

        chat.status = "blocked";
        chat.blockReason = reason;
        await chat.save();

        return ChatMapper.toDTO(chat);
    }

    async getUserChats(userId: string): Promise<ChatDTO[]> {
        const chats = await this._chatRepository.find(
            { participants: userId },
            { sort: { lastMessageAt: -1 }}
        );

        return ChatMapper.toDTOList(chats);
    }
}