"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class MatchController {
    constructor(_matchService) {
        this._matchService = _matchService;
    }
    ;
    async getBestMatchJobs(req, res, next) {
        try {
            const freelancerId = req.user?._id;
            if (!freelancerId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            // filter
            const category = req.query.category;
            const location = req.query.location;
            const budgetMin = req.query.budgetMin ? Number(req.query.budgetMin) : undefined;
            const budgetMax = req.query.budgetMax ? Number(req.query.budgetMax) : undefined;
            const sort = req.query.sort ?? "newest";
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
            const { jobs, nextCursor } = await this._matchService.getBestMatchJobs(freelancerId, limit, cursor, search, { category, location, budgetMin, budgetMax, workMode, skills }, sort);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { jobs, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async getBestMatchFreelancer(req, res, next) {
        try {
            const { jobId } = req.params;
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            // filter
            const location = req.query.location;
            const experience = req.query.experience;
            const hourlyRateMin = req.query.hourlyRateMin ? Number(req.query.hourlyRateMin) : undefined;
            const hourlyRateMax = req.query.hourlyRateMax ? Number(req.query.hourlyRateMax) : undefined;
            const ratingMin = req.query.ratingMin ? Number(req.query.ratingMin) : undefined;
            const { freelancers, nextCursor } = await this._matchService.getBestMatchFreelancers(jobId, limit, cursor, search, { location, experience, hourlyRateMin, hourlyRateMax, ratingMin });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { freelancers, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MatchController = MatchController;
