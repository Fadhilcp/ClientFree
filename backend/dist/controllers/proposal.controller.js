"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalController = void 0;
const response_util_1 = require("../utils/response.util");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const user_constants_1 = require("../constants/user.constants");
class ProposalController {
    constructor(_proposalService) {
        this._proposalService = _proposalService;
    }
    async create(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            const jobId = req.body.jobId;
            if (!freelancerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            if (req.user?.role !== user_constants_1.UserRole.FREELANCER) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Only freelancers can create their proposals.");
            }
            if (!jobId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Job id is needed");
            }
            const { proposal, paymentOrder, paymentId, addOn } = await this._proposalService.createProposal(jobId, freelancerId, req.body);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.CREATED, { proposal, paymentOrder, paymentId, addOn });
        }
        catch (error) {
            next(error);
        }
    }
    async getProposalsForJob(req, res, next) {
        try {
            const jobId = req.params.jobId;
            const status = req.query.status || '';
            const invitation = req.query.invitation === 'true';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!jobId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Job id is needed");
            }
            const { data, total, totalPages } = await this._proposalService.getProposalsForJob(jobId, status, invitation, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { proposals: data, total, totalPages });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const proposalId = req.params.proposalId;
            if (!proposalId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }
            const proposal = await this._proposalService.getById(proposalId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { proposal });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const proposalId = req.params.proposalId;
            if (!proposalId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }
            const updated = await this._proposalService.updateProposal(proposalId, req.body);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { proposal: updated });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const proposalId = req.params.proposalId;
            const { status } = req.body;
            if (!proposalId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }
            if (!status) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Status is required");
            }
            const result = await this._proposalService.updateStatus(proposalId, status);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { result });
        }
        catch (error) {
            next(error);
        }
    }
    async acceptProposal(req, res, next) {
        try {
            const { proposalId } = req.params;
            if (!proposalId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Proposal id is needed');
            await this._proposalService.acceptProposal(proposalId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, 'Proposal accepted');
        }
        catch (error) {
            next(error);
        }
    }
    async inviteFreelancer(req, res, next) {
        try {
            const { jobId, freelancerId } = req.params;
            const clientId = req.user?._id;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const invitationData = req.body;
            const invitation = await this._proposalService.inviteFreelancer(jobId, clientId, freelancerId, invitationData);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { invitation });
        }
        catch (error) {
            next(error);
        }
    }
    async acceptInvitation(req, res, next) {
        try {
            const { jobId, freelancerId } = req.params;
            const { message } = await this._proposalService.acceptInvitation(jobId, freelancerId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, message);
        }
        catch (error) {
            next(error);
        }
    }
    async getMyProposals(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            if (!freelancerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const rawIsInvitation = req.query.isInvitation;
            const isInvitation = typeof rawIsInvitation === "string"
                ? rawIsInvitation.toLowerCase() === "true"
                : false;
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            const { proposals, nextCursor } = await this._proposalService.getMyProposals(freelancerId, isInvitation, search, limit, cursor);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { proposals, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async getProposalsForClient(req, res, next) {
        try {
            const clientId = req.user?._id;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const rawIsInvitation = req.query.isInvitation;
            const isInvitation = typeof rawIsInvitation === "string"
                ? rawIsInvitation.toLowerCase() === "true"
                : false;
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            const { proposals, nextCursor } = await this._proposalService.getProposalsForClient(clientId, isInvitation, search, limit, cursor);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { proposals, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyUpgradePayment(req, res, next) {
        try {
            const { paymentRecordId, razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
            const success = await this._proposalService.verifyUpgradePayment({
                paymentRecordId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "Add-on payment verified", success);
        }
        catch (error) {
            next(error);
        }
    }
    async aiShortlistProposals(req, res, next) {
        try {
            const { jobId } = req.params;
            const { top } = req.query;
            const topN = Number(top);
            const result = await this._proposalService.aiShortlistTopProposals(jobId, topN);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { result }, "Proposals shortlisted with ai");
        }
        catch (error) {
            next(error);
        }
    }
    async cancelProposal(req, res, next) {
        try {
            const proposalId = req.params.proposalId;
            if (!proposalId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Proposal id is needed");
            }
            const freelancerId = req.user?._id;
            if (!freelancerId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const cancelled = await this._proposalService.cancelProposal(proposalId, freelancerId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { proposal: cancelled });
        }
        catch (error) {
            next(error);
        }
    }
    async withdrawInvitation(req, res, next) {
        try {
            const proposalId = req.params.proposalId;
            const clientId = req.user?._id;
            if (!clientId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const proposal = await this._proposalService.withdrawInvitation(proposalId, clientId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { proposal }, "Invitation withdrawn successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async getProposalIsSubmitted(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            const { jobId } = req.params;
            if (!freelancerId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const data = await this._proposalService.getProposalIsSubmitted(jobId, freelancerId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { data });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProposalController = ProposalController;
