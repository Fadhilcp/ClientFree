import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IJobService } from "services/interface/IJobService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class JobController {
    constructor(private service: IJobService){}

    async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            if(!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }

            const data = req.body;
            console.log("🚀 ~ JobController ~ createJob ~ data:", data)

            const job = await this.service.createJob({ ...data, clientId });

            sendResponse(res,HttpStatus.CREATED, { job });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobs = await this.service.getAllJobs();
    
            sendResponse(res, HttpStatus.OK, { jobs });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;

            if(!id) throw createHttpError(HttpStatus.BAD_REQUEST,'job id is needed');

            const job = await this.service.getJobById(id);

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

            const job = await this.service.updateJob(id, data);

            sendResponse(res, HttpStatus.OK, { job });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const id = req.params.id;

            if(!id) throw createHttpError(HttpStatus.BAD_REQUEST,'Job id is needed');

            const message = await this.service.deleteJob(id);

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

            const jobs = await this.service.getClientJobs(clientId, status);

            sendResponse(res, HttpStatus.OK, { jobs });
        } catch (error) {
            next(error);
        }
    }

    async addProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobId = req.params.id;
            const data = req.body;

            if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

            const proposal = await this.service.addProposal(jobId, data);

            sendResponse(res, HttpStatus.OK, { proposal });
        } catch (error) {
            next(error);
        }
    }
}