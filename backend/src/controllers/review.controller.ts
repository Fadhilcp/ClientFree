import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { UserRole } from "constants/user.constants";
import { NextFunction, Request, Response } from "express";
import { IReviewService } from "services/interface/IReviewService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class ReviewController {
    constructor(private _reviewService: IReviewService){};

    async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId, rating, title, comment } = req.body;
            const userId = req.user?._id;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const review = await this._reviewService.createReview({
                jobId,
                reviewerId: userId,
                rating,
                title,
                comment,
            });

            sendResponse(res, HttpStatus.CREATED, { review }, "Review submitted successfully");
        } catch (error) {
            next(error);
        }
    }

    async getReviewsForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            
            const role = req.query.role as UserRole;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if(![UserRole.CLIENT, UserRole.FREELANCER].includes(role)) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Not allowed");
            }

            const reviews = await this._reviewService.getReviewsForUser(userId, role, page, limit);

            sendResponse(res, HttpStatus.OK, { reviews });
        } catch (error) {
            next(error);
        }
    }

    async hasReviewed(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {   
            const { jobId } = req.params;
            const reviewerId = req.user?._id;
            
            if(!reviewerId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }
    
            const hasReviewed = await this._reviewService.hasReviewed(
                jobId,
                reviewerId
            );
    
            sendResponse(res, HttpStatus.OK, { hasReviewed });
        } catch (error) {
           next(error); 
        }
    }

}