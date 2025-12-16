import { Request, Response, NextFunction, raw } from "express";
import { IProposalService } from "services/interface/IProposalService";
import { sendResponse } from "../utils/response.util";
import { HttpStatus } from "../constants/status.constants";
import { createHttpError, HttpError } from "../utils/httpError.util";
import { HttpResponse } from "constants/responseMessage.constant";

export class ProposalController {
    constructor(private _proposalService: IProposalService) {}

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const freelancerId = req.user?._id;
            const jobId = req.body.jobId;

            if (!freelancerId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }
            if (req.user?.role !== "freelancer") {
                throw createHttpError(HttpStatus.FORBIDDEN, "Only freelancers can create their proposals.");
            }
            if (!jobId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Job id is needed");
            }

            const { proposal, paymentOrder, paymentId, addOn } = await this._proposalService.createProposal(jobId, freelancerId, req.body);

            sendResponse(res, HttpStatus.CREATED, { proposal, paymentOrder, paymentId, addOn });
        } catch (error) {
            next(error);
        }
    }

    async getProposalsForJob(req: Request, res: Response, next: NextFunction) {
        try {
            const jobId = req.params.jobId;
            const status = req.query.status as string || '';
            const invitation = req.query.invitation === 'true'

            if (!jobId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Job id is needed");
            }
            const proposals = await this._proposalService.getProposalsForJob(jobId,status,invitation);

            sendResponse(res, HttpStatus.OK, { proposals });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const proposalId = req.params.proposalId;

            if (!proposalId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }

            const proposal = await this._proposalService.getById(proposalId);

            sendResponse(res, HttpStatus.OK, { proposal });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const proposalId = req.params.proposalId;

            if (!proposalId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }

            const updated = await this._proposalService.updateProposal(proposalId, req.body);

            sendResponse(res, HttpStatus.OK, { updated });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const proposalId = req.params.proposalId;
            const { status } = req.body;

            if (!proposalId) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }

            if (!status) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Status is required");
            }

            const result = await this._proposalService.updateStatus(proposalId, status);

            sendResponse(res, HttpStatus.OK, { result });
        } catch (error) {
            next(error);
        }
    }

    async acceptProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { proposalId } = req.params;
            if(!proposalId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Proposal id is needed');

            await this._proposalService.acceptProposal(proposalId);

            sendResponse(res, HttpStatus.OK, {} , 'Proposal accepted');
            
        } catch (error) {
            next(error);
        }
    }

    async inviteFreelancer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId, freelancerId } = req.params;
            const clientId = req.user?._id;
            if (!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }
            const invitationData = req.body;
            const invitation = await this._proposalService.inviteFreelancer(
                jobId, 
                clientId, 
                freelancerId, 
                invitationData
            )

            sendResponse(res, HttpStatus.OK, { invitation });
        } catch (error) {
            next(error);
        }
    }

    async acceptInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId, freelancerId } = req.params;
            const { message } = await this._proposalService.acceptInvitation(jobId, freelancerId);

            sendResponse(res, HttpStatus.OK, {}, message);
        } catch (error) {
            next(error);
        }
    } 

    async getMyProposals(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const freelancerId = req.user?._id;
            if(!freelancerId){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }
            const rawIsInvitation = req.query.isInvitation;
            const isInvitation = typeof rawIsInvitation === "string" 
            ? rawIsInvitation.toLowerCase() === "true" 
            : false;

            //for infinite scroll
            const cursor = req.query.cursor as string | "";
            const limit = parseInt(req.query.limit as string) || 20;

            const { proposals, nextCursor } = await this._proposalService.getMyProposals(freelancerId, isInvitation, limit, cursor);

            sendResponse(res, HttpStatus.OK, { proposals, nextCursor });
        } catch (error) {
            next(error);
        }
    }

    async getProposalsForClient(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            if(!clientId){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }
            const rawIsInvitation = req.query.isInvitation;
            const isInvitation = typeof rawIsInvitation === "string" 
            ? rawIsInvitation.toLowerCase() === "true" 
            : false;

            const search = req.query.search as string || "";
            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;
            
            const { proposals, nextCursor} = await this._proposalService.getProposalsForClient(clientId, isInvitation, search, limit, cursor);

            sendResponse(res, HttpStatus.OK, { proposals, nextCursor });
        } catch (error) {
            next(error);
        }
    }

    async verifyUpgradePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                paymentRecordId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            } = req.body;

            const success = await this._proposalService.verifyUpgradePayment({
                paymentRecordId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            })

            sendResponse(res, HttpStatus.OK, {}, "Add-on payment verified", success);
        } catch (error) {
            next(error);
        }
    }
}