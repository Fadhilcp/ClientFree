import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IMessageService } from "services/interface/IMessageService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class MessageController {
    
    constructor(private _messageService: IMessageService){};

    async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const senderId = req.user?._id;

            if(!senderId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const { chatId } = req.params;
            const { type, content, callDetails } = req.body;
            const file = req.file;

            const message = await this._messageService.sendMessage(
                chatId,
                senderId,
                type,
                content,
                file,
                callDetails
            );

            sendResponse(res, HttpStatus.OK, { message });
        } catch (error) {
            next(error);
        }
    }

    async getChatMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const { chatId } = req.params;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const messages = await this._messageService.getChatMessages(
                chatId,
                userId
            );  
            
            sendResponse(res, HttpStatus.OK, { messages });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const { chatId } = req.params;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            await this._messageService.markMessageAsRead(chatId, userId);

            sendResponse(res, HttpStatus.OK, {});
        } catch (error) {
            next(error);
        }
    }
}