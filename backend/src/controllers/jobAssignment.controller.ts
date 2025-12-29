import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IJobAssignmentService } from "services/interface/IJobAssignmentService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class JobAssignmentController {
    constructor(private _jobAssignmentService: IJobAssignmentService){}

    async getAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobId = req.params.jobId;

            const assignments = await this._jobAssignmentService.getAssignments(jobId);

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

            const assignment = await this._jobAssignmentService.addMilestones(assignmentId, milestones);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async updateMilestone(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const { milestone } = req.body;

            const assignment = await this._jobAssignmentService.updateMilestone(assignmentId, milestoneId, milestone);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async cancelMilestone(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const assignment = await this._jobAssignmentService.cancelMilestone(assignmentId, milestoneId);

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
            // files from aws s3 
            const submissionFiles = (req.files as Express.MulterS3.File[]).map(file => ({
                url: file.location,
                name: file.originalname,
                type: file.mimetype,
                key: file.key
            }));

            const assignment = await this._jobAssignmentService.submitWork(
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

            const assignment = await this._jobAssignmentService.requestChange(assignmentId, milestoneId);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            
            if(req.user?.role !== "client"){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            const assignment = await this._jobAssignmentService.approveMilestone(assignmentId, milestoneId);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async dispute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const { reason } = req.body;
            
            const user = req.user;

            if(!user) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const { assignment, payment } = await this._jobAssignmentService.disputeMilestone(
                assignmentId, milestoneId, user, reason
            );

            sendResponse(res, HttpStatus.OK, { assignment, payment })
        } catch (error) {
            next(error);
        }
    }

    async getApproved(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const assignments = await this._jobAssignmentService.getApprovedMilestones(search, page, limit);

            sendResponse(res, HttpStatus.OK, { milestones: assignments });
        } catch (error) {
            next(error);
        }
    }

    async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId, key } = req.params;
            const userId = req.user?._id;

            if(!userId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            const { url } = await this._jobAssignmentService.getFileUrl(userId ,assignmentId, milestoneId, key);

            sendResponse(res, HttpStatus.OK, { url });
        } catch (error) {
            next(error);
        }
    }

    async getApprovedMilestoneDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;

            const assignment = await this._jobAssignmentService.getApprovedMilestoneById(assignmentId, milestoneId);

            sendResponse(res, HttpStatus.OK, { assignment });
        } catch (error) {
            next(error);
        }
    }

    async getClientEscrowMilestones(req: Request, res: Response, next: NextFunction) {
        try {
            const clientId = req.user?._id;
            if (!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const data = await this._jobAssignmentService.getClientEscrowAndMilestones(clientId, page, limit);

            sendResponse(res, HttpStatus.OK, data);
        } catch (error) {
            next(error);
        }
    }

}