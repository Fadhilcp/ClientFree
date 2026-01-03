import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IMatchService } from "services/interface/IMatchService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class MatchController {

    constructor(
        private _matchService: IMatchService
    ){};
    
    async getBestMatchJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const freelancerId = req.user?._id;

            if(!freelancerId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const search = req.query.search as string || "";
            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;

            // filter
            const category = req.query.category as string | undefined;
            const location = req.query.location as string | undefined;
            const budgetMin = req.query.budgetMin ? Number(req.query.budgetMin) : undefined;
            const budgetMax = req.query.budgetMax ? Number(req.query.budgetMax) : undefined;

            if (
                (budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax))
            ) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid budget values");
            }

            const jobs = await this._matchService.getBestMatchJobs(
                freelancerId, limit, cursor, search,
                { category, location, budgetMin, budgetMax }
            );

            sendResponse(res, HttpStatus.OK, { jobs });
        } catch (error) {
            next(error);
        }
    }

    async getBestMatchFreelancer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const { jobId } = req.params;

            const search = req.query.search as string || "";

            //for infinite scroll
            const cursor = req.query.cursor as string | "";
            const limit = parseInt(req.query.limit as string) || 20;

            // filter
            const location = req.query.location as string | undefined;
            const experience = req.query.experience as string | undefined;
            const hourlyRateMin = req.query.hourlyRateMin ? Number(req.query.hourlyRateMin) : undefined;
            const hourlyRateMax = req.query.hourlyRateMax ? Number(req.query.hourlyRateMax) : undefined;
            const ratingMin = req.query.ratingMin ? Number(req.query.ratingMin) : undefined;

            const freelancers = await this._matchService.getBestMatchFreelancers(
                jobId, limit, cursor, search, 
                { location, experience, hourlyRateMin, hourlyRateMax, ratingMin }
            );

            sendResponse(res, HttpStatus.OK, { freelancers });
        } catch (error) {
            next(error);
        }
    }
}