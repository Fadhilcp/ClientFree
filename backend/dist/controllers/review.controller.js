"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const user_constants_1 = require("../constants/user.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class ReviewController {
    constructor(_reviewService) {
        this._reviewService = _reviewService;
    }
    ;
    async createReview(req, res, next) {
        try {
            const { jobId, rating, title, comment } = req.body;
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const review = await this._reviewService.createReview({
                jobId,
                reviewerId: userId,
                rating,
                title,
                comment,
            });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.CREATED, { review }, "Review submitted successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async editReview(req, res, next) {
        try {
            const { reviewId } = req.params;
            const { rating, title, comment } = req.body;
            const reviewerId = req.user?._id;
            if (!reviewerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const review = await this._reviewService.editReview(reviewId, reviewerId, rating, title, comment);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { review }, "Review updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getMyReviewForJob(req, res, next) {
        try {
            const { jobId } = req.params;
            const reviewerId = req.user?._id;
            if (!reviewerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const review = await this._reviewService.getMyReviewForJob(jobId, reviewerId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { review });
        }
        catch (error) {
            next(error);
        }
    }
    async getReviewsForUser(req, res, next) {
        try {
            const { userId } = req.params;
            const role = req.query.role;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (![user_constants_1.UserRole.CLIENT, user_constants_1.UserRole.FREELANCER].includes(role)) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Not allowed");
            }
            const reviews = await this._reviewService.getReviewsForUser(userId, role, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { reviews });
        }
        catch (error) {
            next(error);
        }
    }
    async hasReviewed(req, res, next) {
        try {
            const { jobId } = req.params;
            const reviewerId = req.user?._id;
            if (!reviewerId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const hasReviewed = await this._reviewService.hasReviewed(jobId, reviewerId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { hasReviewed });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReviewController = ReviewController;
