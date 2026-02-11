import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IJobService } from "../services/interface/IJobService";
import { createHttpError } from "../utils/httpError.util";
import { sendResponse } from "../utils/response.util";
import { UserRole } from "constants/user.constants";
import { JobSort } from "types/filter.type";

export class JobController {
    constructor(private _jobService: IJobService){}

    async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            if(!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }

            const data = req.body;

            const job = await this._jobService.createJob({ ...data, clientId });

            sendResponse(res,HttpStatus.CREATED, { job });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const freelancerId = req.user?._id;
            if(!freelancerId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }

            const search = req.query.search as string || "";
            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;

            const status  = req.query.status as string || '';
            // filter
            const category = req.query.category as string | undefined;
            const location = req.query.location as string | undefined;
            const budgetMin = req.query.budgetMin ? Number(req.query.budgetMin) : undefined;
            const budgetMax = req.query.budgetMax ? Number(req.query.budgetMax) : undefined;
            const workMode = req.query.workMode as "fixed" | "hourly" | undefined;
            const sort = (req.query.sort as JobSort) ?? "newest";

            if (
                (budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax))
            ) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid budget values");
            }

            const skills = req.query.skills
                ? Array.isArray(req.query.skills)
                    ? (req.query.skills as string[])
                    : [req.query.skills as string]
                : [];

            const { jobs, nextCursor } = await this._jobService.getAllJobs(
                freelancerId, status, search, limit, cursor,
                { category, location, budgetMin, budgetMax, workMode, skills },
                sort
            );
    
            sendResponse(res, HttpStatus.OK, { jobs, nextCursor });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;

            if(!id) throw createHttpError(HttpStatus.BAD_REQUEST,'job id is needed');

            const job = await this._jobService.getJobById(id, req.user!);

            sendResponse(res, HttpStatus.OK, { job });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobId = req.params.id;
            const jobData = req.body;

            if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'job id is needed');

            const job = await this._jobService.updateJob(jobId, jobData);

            sendResponse(res, HttpStatus.OK, { job });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const jobId = req.params.id;

            if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST,'Job id is needed');

            const message = await this._jobService.deleteJob(jobId);

            sendResponse(res, HttpStatus.OK, {}, message);
        } catch (error) {
            next(error);
        }
    }

    async getClientJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            if(!clientId) throw createHttpError(HttpStatus.BAD_REQUEST,'user Id is required');

            if (req.user?.role !== UserRole.CLIENT) {
                throw createHttpError(HttpStatus.FORBIDDEN, "Only clients can access their jobs.");
            }
            const status = req.query.status as string || '';
            const search = req.query.search as string || "";
            
            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;

            
            const category = req.query.category as string | undefined;
            const location = req.query.location as string | undefined;
            const sort = (req.query.sort as JobSort) ?? "newest";

            const budgetMin = req.query.budgetMin
                ? Number(req.query.budgetMin)
                : undefined;
            const budgetMax = req.query.budgetMax
                ? Number(req.query.budgetMax)
                : undefined;

            const workMode = req.query.workMode as "fixed" | "hourly" | undefined;
            const skills = req.query.skills 
                ? Array.isArray(req.query.skills) 
                    ? (req.query.skills as string[]) 
                    : [req.query.skills as string]
                : [];

            if (
                (budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax))
            ) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid budget values");
            }

            const { jobs, nextCursor }= await this._jobService.getClientJobs(
                clientId, status, search, limit, cursor,
                { category, location, budgetMin, budgetMax, workMode, skills },
                sort
            );

            sendResponse(res, HttpStatus.OK, { jobs, nextCursor });
        } catch (error) {
            next(error);
        }
    }

    async changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobId = req.params.id;
            const clientId = req.user?._id;
            if(!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }
            const { status } = req.body;

            await this._jobService.changeStatus(jobId, clientId, status);

            sendResponse(res, HttpStatus.OK, {}, "Job status updated");
        } catch (error) {
            next(error);
        }
    }

    async startJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobId = req.params.id;
            const clientId = req.user?._id;
            if(!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }

            const job  = await this._jobService.startJob(jobId, clientId);

            sendResponse(res, HttpStatus.OK, { job }, "Job activated successfully");
        } catch (error) {
            next(error);
        }
    }

    async getFreelancerJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const freelancerId = req.user?._id;
            if(!freelancerId){
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }
            const status = req.query.status as string || "";
            const search = req.query.search as string || "";

            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;

            const category = req.query.category as string | undefined;
            const location = req.query.location as string | undefined;
            const sort = (req.query.sort as JobSort) ?? "newest";

            const budgetMin = req.query.budgetMin
                ? Number(req.query.budgetMin)
                : undefined;
            const budgetMax = req.query.budgetMax
                ? Number(req.query.budgetMax)
                : undefined;

            const workMode = req.query.workMode as "fixed" | "hourly" | undefined;
            const skills = req.query.skills
                ? Array.isArray(req.query.skills)
                    ? (req.query.skills as string[])
                    : [req.query.skills as string]
                : [];

            if (
                (budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax))
            ) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid budget values");
            }

            const { jobs, nextCursor } = await this._jobService.getFreelancerJobs(
                freelancerId, 
                status, 
                search, 
                limit, 
                cursor,
                {
                    category,
                    location,
                    budgetMin,
                    budgetMax,
                    workMode, 
                    skills
                },
                sort
            );

            sendResponse(res, HttpStatus.OK, { jobs, nextCursor })
        } catch (error) {
            next(error);
        }
    }

    async getInterestedJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const freelancerId = req.user?._id;
            if(!freelancerId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }
            const search = req.query.search as string || "";
            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;

            const category = req.query.category as string | undefined;
            const location = req.query.location as string | undefined;
            const budgetMin = req.query.budgetMin ? Number(req.query.budgetMin) : undefined;
            const budgetMax = req.query.budgetMax ? Number(req.query.budgetMax) : undefined;
            const sort = (req.query.sort as JobSort) ?? "newest";

            
            const workMode = req.query.workMode as "fixed" | "hourly" | undefined;
            const skills = req.query.skills
                ? Array.isArray(req.query.skills)
                    ? (req.query.skills as string[])
                    : [req.query.skills as string]
                : [];

            if (
                (budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax))
            ) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid budget values");
            }

            const { jobs, nextCursor } = await this._jobService.getInterestedJobsForFreelancer(
                freelancerId, search, limit, cursor,
                { category, location, budgetMin, budgetMax, workMode, skills },
                sort
            );

            sendResponse(res, HttpStatus.OK, { jobs, nextCursor });
        } catch (error) {
            next(error);
        }
    }

    async addJobInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const freelancerId = req.user?._id;
            if(!freelancerId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }
            const jobId = req.params.jobId;

            await this._jobService.addJobInterest(freelancerId, jobId);

            sendResponse(res, HttpStatus.OK, {}, "Interested Job added");
        } catch (error) {
            next(error);
        }
    }

    async removeJobInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const freelancerId = req.user?._id;
            const jobId = req.params.jobId;
            if(!freelancerId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }

            await this._jobService.removeJobInterest(freelancerId, jobId);
            sendResponse(res, HttpStatus.OK, {}, "Interested job status updated");
        } catch (error) {
            next(error);
        }
    }

    async cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId } = req.params;

            const user = req.user;
            if(!user){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            const message = await this._jobService.cancelJob(jobId, user);

            sendResponse(res, HttpStatus.OK, {}, message);
        } catch (error) {
            next(error);
        }
    }
}