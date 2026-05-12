import { NextFunction, Request, Response } from "express";
import { IAiService } from "../services/interface/IAiService";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { sendResponse } from "../utils/response.util";

export class AiController {
    constructor(
        private _aiService: IAiService
    ){}

    async getJobSuggestions(req: Request, res: Response, next: NextFunction){
        try {
            const { title } = req.body;

            if(!title) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Title is required")
            }

            const suggestions = await this._aiService.generateJobSuggestion(title);
            sendResponse(res, HttpStatus.OK, { suggestions });
        } catch (error) {
            next(error);
        }
    }
}