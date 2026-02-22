import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IChatService } from "../services/interface/IChatService";
import { createHttpError } from "../utils/httpError.util";
import { sendResponse } from "../utils/response.util";

export class ChatController {

    constructor(private _chatService: IChatService){};

    async getOrCreateChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const initiatorId = req.user?._id;
            const { receiverId, jobId } = req.body;

            if(!initiatorId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const chat = await this._chatService.getOrCreateChat(
                initiatorId,
                receiverId,
                jobId
            );

            sendResponse(res, HttpStatus.OK, { chat });
        } catch (error) {
            next(error);
        }
    }

    async getMyChats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            const search = req.query.search as string || "";

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const chats = await this._chatService.getUserChats(userId, search);

            sendResponse(res, HttpStatus.OK, { chats });
        } catch (error) {
            next(error);
        }
    }

    async blockChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { chatId } = req.params;
            const { reason } = req.body;

            const chat = await this._chatService.blockChat(chatId, reason);

            sendResponse(res, HttpStatus.OK, { chat });
        } catch (error) {
            next(error);
        }
    }

    async updateChatBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { chatId } = req.params;

            const chat = await this._chatService.updateBlockStatus(chatId);

            sendResponse(res, HttpStatus.OK, { chat });
        } catch (error) {
            next(error);
        }
    }
}