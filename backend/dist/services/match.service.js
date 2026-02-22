"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchService = void 0;
const job_mapper_1 = require("../mappers/job.mapper");
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const bestMatchCache_util_1 = require("../utils/bestMatchCache.util");
const matchScore_helper_1 = require("../helpers/matchScore.helper");
const mongoose_1 = require("mongoose");
const freelancer_mapper_1 = require("../mappers/freelancer.mapper");
const user_constants_1 = require("../constants/user.constants");
const buildJobSort_1 = require("../helpers/buildJobSort");
class MatchService {
    constructor(_jobRepository, _userRepository, _subscriptionService) {
        this._jobRepository = _jobRepository;
        this._userRepository = _userRepository;
        this._subscriptionService = _subscriptionService;
    }
    ;
    async getBestMatchJobs(freelancerId, limit, cursor, search, filters, sort = "newest") {
        const plan = await this._subscriptionService.getActiveFeatures(freelancerId);
        if (!plan)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.SUBSCRIPTION_NOT_FOUND);
        if (!plan?.features?.BestMatch) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Your subscription does not include the Best Match feature.");
        }
        const freelancer = await this._userRepository.findById(freelancerId);
        if (!freelancer) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        }
        let filter = {
            status: "open",
            visibility: "public",
            isDeleted: false,
        };
        if (cursor)
            filter._id = { $lt: cursor };
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { title: regex },
                { category: regex },
                { subcategory: regex }
            ];
        }
        if (filters?.category)
            filter.category = filters.category;
        if (filters?.budgetMin !== undefined || filters?.budgetMax !== undefined) {
            filter["payment.budget"] = {};
            if (filters.budgetMin !== undefined)
                filter["payment.budget"].$gte = filters.budgetMin;
            if (filters.budgetMax !== undefined)
                filter["payment.budget"].$lte = filters.budgetMax;
        }
        if (filters?.location?.trim()) {
            const loc = filters.location.trim();
            filter.$or = [
                ...(filter.$or ?? []),
                { "locationPreference.city": { $regex: loc, $options: "i" } },
                { "locationPreference.country": { $regex: loc, $options: "i" } }
            ];
        }
        // workmode
        if (filters?.workMode) {
            filter["payment.type"] = filters.workMode;
        }
        // Skills
        if (filters?.skills && filters.skills.length > 0) {
            filter.skills = { $all: filters.skills.map(id => new mongoose_1.Types.ObjectId(id)) };
        }
        const sortQuery = (0, buildJobSort_1.buildJobSort)(sort);
        const jobs = await this._jobRepository.findWithSkillsPaginated(filter, limit * 3, sortQuery);
        const ranked = await Promise.all(jobs.map(async (job) => {
            const cached = await bestMatchCache_util_1.MatchCacheService.get(job._id.toString(), freelancerId);
            const score = cached?.score ??
                matchScore_helper_1.MatchScoreHelper.computeJobForFreelancer(freelancer, job);
            if (!cached) {
                await bestMatchCache_util_1.MatchCacheService.set(job._id.toString(), freelancerId, score);
            }
            return {
                ...job.toObject(),
                matchScore: score,
            };
        }));
        const filtered = ranked.filter(j => j.matchScore >= 10)
            .sort((a, b) => b.matchScore - a.matchScore);
        const paginated = filtered.slice(0, limit);
        const nextCursor = paginated.length > 0 ? paginated[paginated.length - 1]._id.toString() : null;
        return {
            jobs: paginated.map(job => job_mapper_1.JobMapper.toListDTO(job)),
            nextCursor
        };
    }
    async getBestMatchFreelancers(jobId, limit, cursor, search, filters) {
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        const filter = { role: user_constants_1.UserRole.FREELANCER, isProfileCompleted: true, status: "active" };
        // search
        if (search?.trim()) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { username: regex },
                { name: regex },
                { professionalTitle: regex }
            ];
        }
        // location filter
        if (filters?.location?.trim()) {
            const loc = filters.location.trim();
            filter.$or = [
                ...(filter.$or ?? []),
                { "location.city": { $regex: loc, $options: "i" } },
                { "location.state": { $regex: loc, $options: "i" } },
                { "location.country": { $regex: loc, $options: "i" } },
            ];
        }
        // experience
        if (filters?.experience)
            filter.experienceLevel = filters.experience;
        // hourly rate
        if (filters?.hourlyRateMin !== undefined || filters?.hourlyRateMax !== undefined) {
            filter.hourlyRate = {};
            if (filters.hourlyRateMin !== undefined)
                filter.hourlyRate.$gte = filters.hourlyRateMin;
            if (filters.hourlyRateMax !== undefined)
                filter.hourlyRate.$lte = filters.hourlyRateMax;
        }
        // rating
        if (filters?.ratingMin !== undefined) {
            filter["ratings.asFreelancer"] = { $gte: filters.ratingMin };
        }
        // cursor for infinite scroll
        if (cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { $lt: cursor };
        }
        // fetch candidates
        const freelancers = await this._userRepository.findWithSkillsPaginated(filter, limit * 3);
        const ranked = freelancers.map(user => ({
            ...user.toObject(),
            matchScore: matchScore_helper_1.MatchScoreHelper.computeFreelancerForJob(job, user),
        }));
        const filtered = ranked.filter(f => f.matchScore >= 60).sort((a, b) => b.matchScore - a.matchScore);
        // paginate using limit & cursor
        const paginated = filtered.slice(0, limit);
        const nextCursor = paginated.length > 0 ? paginated[paginated.length - 1]._id.toString() : null;
        return {
            freelancers: paginated.map(freelancer_mapper_1.mapUserToFreelancerListItemDto),
            nextCursor
        };
    }
}
exports.MatchService = MatchService;
