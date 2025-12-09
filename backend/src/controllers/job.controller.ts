import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IJobService } from "services/interface/IJobService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class JobController {
    constructor(private _service: IJobService){}

    async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            if(!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }

            const data = req.body;

            const job = await this._service.createJob({ ...data, clientId });

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
            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;

            const status  = req.query.status as string || '';
            const { jobs, nextCursor } = await this._service.getAllJobs(freelancerId, status, limit, cursor);
    
            sendResponse(res, HttpStatus.OK, { jobs, nextCursor });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;

            if(!id) throw createHttpError(HttpStatus.BAD_REQUEST,'job id is needed');

            const job = await this._service.getJobById(id, req.user!);

            sendResponse(res, HttpStatus.OK, { job });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const data = req.body;

            if(!id) throw createHttpError(HttpStatus.BAD_REQUEST, 'job id is needed');

            const job = await this._service.updateJob(id, data);

            sendResponse(res, HttpStatus.OK, { job });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const id = req.params.id;

            if(!id) throw createHttpError(HttpStatus.BAD_REQUEST,'Job id is needed');

            const message = await this._service.deleteJob(id);

            sendResponse(res, HttpStatus.OK, {}, message);
        } catch (error) {
            next(error);
        }
    }

    async getClientJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            const status = req.query.status as string || '';
            
            if(!clientId) throw createHttpError(HttpStatus.BAD_REQUEST,'user Id is needed');
            if (req.user?.role !== "client") {
                throw createHttpError(HttpStatus.FORBIDDEN, "Only clients can access their jobs.");
            }
            const jobs = await this._service.getClientJobs(clientId, status);

            sendResponse(res, HttpStatus.OK, { jobs });
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

            await this._service.changeStatus(jobId, clientId, status);

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

            const job  = await this._service.startJob(jobId, clientId);

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

            const jobs = await this._service.getFreelancerJobs(freelancerId, status);

            sendResponse(res, HttpStatus.OK, { jobs })
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
            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;

            const { jobs, nextCursor } = await this._service.getInterestedJobsForFreelancer(
                freelancerId, limit, cursor
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

            await this._service.addJobInterest(freelancerId, jobId);

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

            await this._service.removeJobInterest(freelancerId, jobId);
            sendResponse(res, HttpStatus.OK, {}, "Interested job status updated");
        } catch (error) {
            next(error);
        }
    }
}