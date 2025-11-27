import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IJobAssignmentService } from "services/interface/IJobAssignmentService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class JobAssignmentController {
    constructor(private service: IJobAssignmentService){}

    async getAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobId = req.params.id;

            const assignments = await this.service.getAssignments(jobId);

            sendResponse(res, HttpStatus.OK, { assignments });
        } catch (error) {
            next(error);
        }
    }

    async addMilestones(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { id } = req.params;
            const { milestones } = req.body;

            if(!Array.isArray(milestones)){
                throw createHttpError(HttpStatus.BAD_REQUEST, "Milestones should be Array");
            }

            const assignment = await this.service.addMilestones(id, milestones);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }
}