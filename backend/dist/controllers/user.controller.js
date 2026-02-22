"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const profile_schema_1 = require("../schema/profile.schema");
const response_util_1 = require("../utils/response.util");
const user_constants_1 = require("../constants/user.constants");
class ProfileController {
    constructor(_userService) {
        this._userService = _userService;
    }
    async getMe(req, res, next) {
        try {
            if (!req.user || !req.user._id) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
            }
            const userId = req.user._id;
            const user = await this._userService.getMyProfile(userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { user });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            if (!req.user || !req.user._id) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
            }
            const userId = req.user?._id;
            const schema = req.user.role === user_constants_1.UserRole.FREELANCER ? profile_schema_1.freelancerUpdateSchema : profile_schema_1.clientUpdateSchema;
            const result = schema.safeParse(req.body);
            if (!result.success) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.INVALID_CREDENTIALS);
            }
            const user = await this._userService.updateProfile(userId, result.data);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { user });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this._userService.getUserProfileById(id);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { user });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const search = req.query.search || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const users = await this._userService.getAllUsers(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { users });
        }
        catch (error) {
            next(error);
        }
    }
    async setProfileImage(req, res, next) {
        try {
            if (!req.user) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
            }
            if (!req.file) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.NO_FILE_FOUND);
            }
            const { profileImage } = await this._userService.setProfileImage(req.user?._id, req.file);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { profileImage });
        }
        catch (error) {
            next(error);
        }
    }
    async removeProfileImage(req, res, next) {
        try {
            if (!req.user) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
            }
            const { profileImage } = await this._userService.removeProfileImage(req.user._id);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { profileImage });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const userId = req.params.id;
            const { status } = req.body;
            if (!status)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Status field is required');
            const user = await this._userService.changeUserStatus(userId, status);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { user });
        }
        catch (error) {
            next(error);
        }
    }
    async getFreelancers(req, res, next) {
        try {
            const search = req.query.search || "";
            //for infinite scroll
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 20;
            const clientId = req.user?._id;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            // filter
            const location = req.query.location;
            const experience = req.query.experience;
            const hourlyRateMin = req.query.hourlyRateMin ? Number(req.query.hourlyRateMin) : undefined;
            const hourlyRateMax = req.query.hourlyRateMax ? Number(req.query.hourlyRateMax) : undefined;
            const ratingMin = req.query.ratingMin ? Number(req.query.ratingMin) : undefined;
            const skills = req.query.skills
                ? Array.isArray(req.query.skills)
                    ? req.query.skills
                    : [req.query.skills]
                : [];
            const { freelancers, nextCursor } = await this._userService.getFreelancers(clientId, search, limit, cursor, { location, experience, hourlyRateMin, hourlyRateMax, ratingMin, skills });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { freelancers, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async getInterestedFreelancer(req, res, next) {
        try {
            const clientId = req.user?._id;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
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
            const { freelancers, nextCursor } = await this._userService.getInterestedFreelancers(clientId, search, limit, cursor, { location, experience, hourlyRateMin, hourlyRateMax, ratingMin });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { freelancers, nextCursor });
        }
        catch (error) {
            next(error);
        }
    }
    async addFreelancerInterest(req, res, next) {
        try {
            const clientId = req.user?._id;
            const freelancerId = req.params.freelancerId;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            await this._userService.addFreelancerInterest(clientId, freelancerId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "Interested freelancer added");
        }
        catch (error) {
            next(error);
        }
    }
    async removeFreelancerInterest(req, res, next) {
        try {
            const clientId = req.user?._id;
            const freelancerId = req.params.freelancerId;
            if (!clientId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            await this._userService.removeFreelancerInterest(clientId, freelancerId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "Interested freelancer status updated");
        }
        catch (error) {
            next(error);
        }
    }
    async searchUsers(req, res, next) {
        try {
            const search = req.query.search || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const users = await this._userService.searchUsersForSelect(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { users });
        }
        catch (error) {
            next(error);
        }
    }
    async getUsersByIds(req, res, next) {
        try {
            const rawUserIds = req.query.userIds;
            if (!rawUserIds)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "userIds is required");
            const userIds = (Array.isArray(rawUserIds) ? rawUserIds : [rawUserIds])
                .filter((id) => typeof id === "string");
            if (userIds.length === 0)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "userIds cannot be empty");
            const users = await this._userService.getUsersByIds(userIds);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { users });
        }
        catch (error) {
            next(error);
        }
    }
    async uploadResume(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            if (!req.file) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Resume file is required");
            }
            const file = req.file;
            const resume = await this._userService.uploadResume(userId, {
                key: file.key,
                uploadedAt: new Date(),
            });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { resume }, "Resume uploaded successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProfileController = ProfileController;
