import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IJobAssignmentService } from "services/interface/IJobAssignmentService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class JobAssignmentController {
    constructor(private service: IJobAssignmentService){}

    async getAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobId = req.params.jobId;

            const assignments = await this.service.getAssignments(jobId);

            sendResponse(res, HttpStatus.OK, { assignments });
        } catch (error) {
            next(error);
        }
    }

    async addMilestones(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { assignmentId } = req.params;
            const { milestones } = req.body;

            if(!Array.isArray(milestones)){
                throw createHttpError(HttpStatus.BAD_REQUEST, "Milestones should be Array");
            }

            const assignment = await this.service.addMilestones(assignmentId, milestones);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async updateMilestone(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const { milestone } = req.body;

            const assignment = await this.service.updateMilestone(assignmentId, milestoneId, milestone);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async cancelMilestone(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const assignment = await this.service.cancelMilestone(assignmentId, milestoneId);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const freelancerId = req.user?._id;
            if(!freelancerId){
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }
            const submissionNote = req.body.note;
            const submissionFiles = req.body.files || [];

            const assignment = await this.service.submitWork(
                assignmentId,
                milestoneId,
                freelancerId,
                submissionNote,
                submissionFiles,
            );

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async requestChange(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const { reason } = req.body;

            const assignment = await this.service.requestChange(assignmentId, milestoneId, reason);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            
            if(req.user?.role === "client"){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            const assignment = await this.service.approveMilestone(assignmentId, milestoneId);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async dispute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const { reason } = req.body;

            const { assignment, payment } = await this.service.disputeMilestone(assignmentId, milestoneId, reason);

            sendResponse(res, HttpStatus.OK, { assignment, payment })
        } catch (error) {
            next(error);
        }
    }
}