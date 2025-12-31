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

            const jobs = await this._matchService.getBestMatchJobs(freelancerId);

            sendResponse(res, HttpStatus.OK, { jobs });
        } catch (error) {
            next(error);
        }
    }

    async getBestMatchFreelancer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const { jobId } = req.params;

            const freelancers = await this._matchService.getBestMatchFreelancers(jobId);

            sendResponse(res, HttpStatus.OK, { freelancers });
        } catch (error) {
            next(error);
        }
    }
}