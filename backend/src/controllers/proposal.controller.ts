import { Request, Response, NextFunction } from "express";
import { IProposalService } from "services/interface/IProposalService";
import { sendResponse } from "../utils/response.util";
import { HttpStatus } from "../constants/status.constants";
import { createHttpError } from "../utils/httpError.util";

export class ProposalController {
    constructor(private service: IProposalService) {}

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const freelancerId = req.user?._id;
            const jobId = req.body.jobId;

            if (!freelancerId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, "Unauthorized");
            }

            if (!jobId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Job id is needed");
            }

            const proposal = await this.service.createProposal(jobId, freelancerId, req.body);

            sendResponse(res, HttpStatus.CREATED, { proposal });
        } catch (error) {
            next(error);
        }
    }

    async getProposalsForJob(req: Request, res: Response, next: NextFunction) {
        try {
            const jobId = req.params.jobId;

            if (!jobId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Job id is needed");
            }

            const proposals = await this.service.getProposalsForJob(jobId);

            sendResponse(res, HttpStatus.OK, { proposals });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;

            if (!id) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }

            const proposal = await this.service.getById(id);

            sendResponse(res, HttpStatus.OK, { proposal });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;

            if (!id) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }

            const updated = await this.service.updateProposal(id, req.body);

            sendResponse(res, HttpStatus.OK, { updated });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const { status } = req.body;

            if (!id) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }

            if (!status) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Status is required");
            }

            const result = await this.service.updateStatus(id, status);

            sendResponse(res, HttpStatus.OK, { result });
        } catch (error) {
            next(error);
        }
    }
}
