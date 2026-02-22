import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IClarificationService } from "../services/interface/IClarificationService";
import { createHttpError } from "../utils/httpError.util";
import { sendResponse } from "../utils/response.util";
import { UserRole } from "../constants/user.constants";

export class ClarificationController {
    constructor(private _clarificationService: IClarificationService){}

    async addMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const { jobId } = req.params;
            const { message } = req.body;
            const senderId = req.user?._id;
            const senderRole = req.user?.role;

            if(!senderId || !senderRole) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            if(![UserRole.FREELANCER, UserRole.CLIENT].includes(senderRole)) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Now allowed")
            }

            const newMessage = await this._clarificationService.addMessage(
                jobId,
                senderId,
                senderRole,
                message
            )

            sendResponse(res, HttpStatus.CREATED, { message: newMessage });
        } catch (error) {
            next(error);
        }
    }

    async getBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId } = req.params;

            const { board, messages } = await this._clarificationService.getBoard(jobId);

            sendResponse(res, HttpStatus.OK, { board, messages });
        } catch (error) {
            next(error);
        }
    }

    async closeBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId } = req.params;
            const requesterId = req.user?._id;
            if(!requesterId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            const board = await this._clarificationService.closeBoard(jobId, requesterId);

            sendResponse(res, HttpStatus.OK, { board });
        } catch (error) {
            next(error);
        }
    }
}