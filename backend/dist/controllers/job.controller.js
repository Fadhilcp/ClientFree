"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
const user_constants_1 = require("../constants/user.constants");
class JobController {
    constructor(_jobService) {
        this._jobService = _jobService;
    }
    async createJob(req, res, next) {
        try {
            const clientId = req.user?._id;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const data = req.body;
            const job = await this._jobService.createJob({ ...data, clientId });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.CREATED, { job });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            if (!freelancerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status || '';
            // filter
            const category = req.query.category;
            const location = req.query.location;
            const budgetMin = req.query.budgetMin ? Number(req.query.budgetMin) : undefined;
            const budgetMax = req.query.budgetMax ? Number(req.query.budgetMax) : undefined;
            const hoursPerDay = req.query.hoursPerDay
                ? Number(req.query.hoursPerDay)
                : undefined;
            const workMode = req.query.workMode;
            const sort = req.query.sort ?? "newest";
            if ((budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax)) ||
                (hoursPerDay !== undefined && Number.isNaN(hoursPerDay))) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid budget values");
            }
            const skills = req.query.skills
                ? Array.isArray(req.query.skills)
                    ? req.query.skills
                    : [req.query.skills]
                : [];
            const { jobs, nextCursor } = await this._jobService.getAllJobs(freelancerId, status, search, limit, cursor, { category, location, budgetMin, budgetMax, workMode, skills, hoursPerDay }, sort);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { jobs, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = req.params.id;
            if (!id)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'job id is needed');
            const job = await this._jobService.getJobById(id, req.user);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { job });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const jobId = req.params.id;
            const jobData = req.body;
            if (!jobId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'job id is needed');
            const job = await this._jobService.updateJob(jobId, jobData);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { job });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const jobId = req.params.id;
            if (!jobId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Job id is needed');
            const message = await this._jobService.deleteJob(jobId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, message);
        }
        catch (error) {
            next(error);
        }
    }
    async getClientJobs(req, res, next) {
        try {
            const clientId = req.user?._id;
            if (!clientId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'user Id is required');
            if (req.user?.role !== user_constants_1.UserRole.CLIENT) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Only clients can access their jobs.");
            }
            const status = req.query.status || '';
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            const category = req.query.category;
            const location = req.query.location;
            const sort = req.query.sort ?? "newest";
            const budgetMin = req.query.budgetMin
                ? Number(req.query.budgetMin)
                : undefined;
            const budgetMax = req.query.budgetMax
                ? Number(req.query.budgetMax)
                : undefined;
            const hoursPerDay = req.query.hoursPerDay
                ? Number(req.query.hoursPerDay)
                : undefined;
            const workMode = req.query.workMode;
            const skills = req.query.skills
                ? Array.isArray(req.query.skills)
                    ? req.query.skills
                    : [req.query.skills]
                : [];
            if ((budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax)) ||
                (hoursPerDay !== undefined && Number.isNaN(hoursPerDay))) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid budget values");
            }
            const { jobs, nextCursor } = await this._jobService.getClientJobs(clientId, status, search, limit, cursor, { category, location, budgetMin, budgetMax, workMode, skills, hoursPerDay }, sort);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { jobs, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async changeStatus(req, res, next) {
        try {
            const jobId = req.params.id;
            const clientId = req.user?._id;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const { status } = req.body;
            await this._jobService.changeStatus(jobId, clientId, status);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "Job status updated");
        }
        catch (error) {
            next(error);
        }
    }
    async startJob(req, res, next) {
        try {
            const jobId = req.params.id;
            const clientId = req.user?._id;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const job = await this._jobService.startJob(jobId, clientId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { job }, "Job activated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async getFreelancerJobs(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            if (!freelancerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const status = req.query.status || "";
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            const category = req.query.category;
            const location = req.query.location;
            const sort = req.query.sort ?? "newest";
            const budgetMin = req.query.budgetMin
                ? Number(req.query.budgetMin)
                : undefined;
            const budgetMax = req.query.budgetMax
                ? Number(req.query.budgetMax)
                : undefined;
            const hoursPerDay = req.query.hoursPerDay
                ? Number(req.query.hoursPerDay)
                : undefined;
            const workMode = req.query.workMode;
            const skills = req.query.skills
                ? Array.isArray(req.query.skills)
                    ? req.query.skills
                    : [req.query.skills]
                : [];
            if ((budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax))) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid budget values");
            }
            const { jobs, nextCursor } = await this._jobService.getFreelancerJobs(freelancerId, status, search, limit, cursor, {
                category,
                location,
                budgetMin,
                budgetMax,
                workMode,
                skills,
                hoursPerDay
            }, sort);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { jobs, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async getInterestedJobs(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            if (!freelancerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            const category = req.query.category;
            const location = req.query.location;
            const budgetMin = req.query.budgetMin ? Number(req.query.budgetMin) : undefined;
            const budgetMax = req.query.budgetMax ? Number(req.query.budgetMax) : undefined;
            const sort = req.query.sort ?? "newest";
            const hoursPerDay = req.query.hoursPerDay
                ? Number(req.query.hoursPerDay)
                : undefined;
            const workMode = req.query.workMode;
            const skills = req.query.skills
                ? Array.isArray(req.query.skills)
                    ? req.query.skills
                    : [req.query.skills]
                : [];
            if ((budgetMin !== undefined && Number.isNaN(budgetMin)) ||
                (budgetMax !== undefined && Number.isNaN(budgetMax)) ||
                (hoursPerDay !== undefined && Number.isNaN(hoursPerDay))) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid budget values");
            }
            const { jobs, nextCursor } = await this._jobService.getInterestedJobsForFreelancer(freelancerId, search, limit, cursor, { category, location, budgetMin, budgetMax, workMode, skills, hoursPerDay }, sort);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { jobs, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async addJobInterest(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            if (!freelancerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const jobId = req.params.jobId;
            await this._jobService.addJobInterest(freelancerId, jobId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "Interested Job added");
        }
        catch (error) {
            next(error);
        }
    }
    async removeJobInterest(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            const jobId = req.params.jobId;
            if (!freelancerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            await this._jobService.removeJobInterest(freelancerId, jobId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "Interested job status updated");
        }
        catch (error) {
            next(error);
        }
    }
    async cancelJob(req, res, next) {
        try {
            const { jobId } = req.params;
            const user = req.user;
            if (!user) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const message = await this._jobService.cancelJob(jobId, user);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, message);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.JobController = JobController;
