"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobAssignmentController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
const user_constants_1 = require("../constants/user.constants");
class JobAssignmentController {
    constructor(_jobAssignmentService) {
        this._jobAssignmentService = _jobAssignmentService;
    }
    async getAssignments(req, res, next) {
        try {
            const jobId = req.params.jobId;
            const assignments = await this._jobAssignmentService.getAssignments(jobId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignments });
        }
        catch (error) {
            next(error);
        }
    }
    async addMilestones(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const { milestones } = req.body;
            if (!Array.isArray(milestones)) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Milestones should be Array");
            }
            const assignment = await this._jobAssignmentService.addMilestones(assignmentId, milestones);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async updateMilestone(req, res, next) {
        try {
            const { assignmentId, milestoneId } = req.params;
            const { milestone } = req.body;
            const assignment = await this._jobAssignmentService.updateMilestone(assignmentId, milestoneId, milestone);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async cancelMilestone(req, res, next) {
        try {
            const { assignmentId, milestoneId } = req.params;
            const assignment = await this._jobAssignmentService.cancelMilestone(assignmentId, milestoneId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async submit(req, res, next) {
        try {
            const { assignmentId, milestoneId } = req.params;
            const freelancerId = req.user?._id;
            if (!freelancerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const submissionNote = req.body.note;
            // files from aws s3 
            const submissionFiles = req.files.map(file => ({
                url: file.location,
                name: file.originalname,
                type: file.mimetype,
                key: file.key
            }));
            const assignment = await this._jobAssignmentService.submitWork(assignmentId, milestoneId, freelancerId, submissionNote, submissionFiles);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async requestChange(req, res, next) {
        try {
            const { assignmentId, milestoneId } = req.params;
            const assignment = await this._jobAssignmentService.requestChange(assignmentId, milestoneId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async approve(req, res, next) {
        try {
            const { assignmentId, milestoneId } = req.params;
            if (req.user?.role !== user_constants_1.UserRole.CLIENT) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const assignment = await this._jobAssignmentService.approveMilestone(assignmentId, milestoneId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async dispute(req, res, next) {
        try {
            const { assignmentId, milestoneId } = req.params;
            const { reason } = req.body;
            const user = req.user;
            if (!user)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const { assignment, payment } = await this._jobAssignmentService.disputeMilestone(assignmentId, milestoneId, user, reason);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignment, payment });
        }
        catch (error) {
            next(error);
        }
    }
    async getApproved(req, res, next) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const assignments = await this._jobAssignmentService.getApprovedMilestones(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { milestones: assignments });
        }
        catch (error) {
            next(error);
        }
    }
    async downloadFile(req, res, next) {
        try {
            const { assignmentId, milestoneId, key } = req.params;
            const userId = req.user?._id;
            if (!userId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const { url } = await this._jobAssignmentService.getFileUrl(userId, assignmentId, milestoneId, key);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { url });
        }
        catch (error) {
            next(error);
        }
    }
    async getApprovedMilestoneDetail(req, res, next) {
        try {
            const { assignmentId, milestoneId } = req.params;
            const assignment = await this._jobAssignmentService.getApprovedMilestoneById(assignmentId, milestoneId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { assignment });
        }
        catch (error) {
            next(error);
        }
    }
    async getClientEscrowMilestones(req, res, next) {
        try {
            const clientId = req.user?._id;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await this._jobAssignmentService.getClientEscrowAndMilestones(clientId, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, data);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllEscrowMilestones(req, res, next) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const milestones = await this._jobAssignmentService.getAllEscrowMilestones(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { milestones });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.JobAssignmentController = JobAssignmentController;
