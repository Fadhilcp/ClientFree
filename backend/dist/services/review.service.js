"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const mongoose_1 = require("mongoose");
const user_constants_1 = require("../constants/user.constants");
const review_mapper_1 = require("../mappers/review.mapper");
class ReviewService {
    constructor(_reviewRepository, _userRepository, _jobRepository, _jobAssignmentRepository) {
        this._reviewRepository = _reviewRepository;
        this._userRepository = _userRepository;
        this._jobRepository = _jobRepository;
        this._jobAssignmentRepository = _jobAssignmentRepository;
    }
    ;
    async createReview({ jobId, reviewerId, rating, title, comment, }) {
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        if (job.status !== "completed") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Job is not completed");
        }
        const existingReview = await this._reviewRepository.findOne({
            jobId,
            reviewerId,
        });
        if (existingReview) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "You have already reviewed this job");
        }
        const assignment = await this._jobAssignmentRepository.findOne({
            jobId,
            status: "completed"
        });
        if (!assignment) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Job assignment not completed");
        }
        let reviewerRole;
        let revieweeRole;
        let revieweeId;
        if (job.clientId.equals(reviewerId)) {
            reviewerRole = "client";
            revieweeRole = "freelancer";
            revieweeId = new mongoose_1.Types.ObjectId(assignment.freelancerId);
        }
        else if (new mongoose_1.Types.ObjectId(assignment.freelancerId).equals(reviewerId)) {
            reviewerRole = "freelancer";
            revieweeRole = "client";
            revieweeId = job.clientId;
        }
        else {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "You are not part of this job");
        }
        const review = await this._reviewRepository.create({
            jobId,
            reviewerId: new mongoose_1.Types.ObjectId(reviewerId),
            revieweeId,
            reviewerRole,
            revieweeRole,
            rating,
            title,
            comment,
        });
        await this._updateUserRating(revieweeId, revieweeRole, rating);
        return (0, review_mapper_1.mapReview)(review);
    }
    async _updateUserRating(userId, role, newRating) {
        const user = await this._userRepository.findById(userId.toString());
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        const ratings = user.ratings ?? { asClient: 0, asFreelancer: 0 };
        const stats = user.stats ?? { reviewsCount: 0 };
        const asClient = ratings.asClient ?? 0;
        const asFreelancer = ratings.asFreelancer ?? 0;
        const count = stats.reviewsCount ?? 0;
        if (role === "freelancer") {
            ratings.asFreelancer = (asFreelancer * count + newRating) / (count + 1);
        }
        else {
            ratings.asClient = (asClient * count + newRating) / (count + 1);
        }
        stats.reviewsCount = count + 1;
        user.ratings = ratings;
        user.stats = stats;
        await user.save();
    }
    async editReview(reviewId, reviewerId, rating, title, comment) {
        const review = await this._reviewRepository.findById(reviewId);
        if (!review) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Review not found");
        }
        if (!review.reviewerId.equals(reviewerId)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Not allowed to edit this review");
        }
        const oldRating = review.rating;
        review.rating = rating;
        review.title = title;
        review.comment = comment;
        review.editedAt = new Date();
        await review.save();
        await this._recalculateUserRatingOnEdit(review.revieweeId, review.revieweeRole, oldRating, rating);
        return (0, review_mapper_1.mapReview)(review);
    }
    async _recalculateUserRatingOnEdit(userId, role, oldRating, newRating) {
        const user = await this._userRepository.findById(userId.toString());
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        const ratings = {
            asClient: user.ratings?.asClient ?? 0,
            asFreelancer: user.ratings?.asFreelancer ?? 0,
        };
        const stats = {
            reviewsCount: user.stats?.reviewsCount ?? 0,
        };
        if (stats.reviewsCount <= 0)
            return;
        if (role === "freelancer") {
            ratings.asFreelancer =
                (ratings.asFreelancer * stats.reviewsCount - oldRating + newRating) /
                    stats.reviewsCount;
        }
        else {
            ratings.asClient =
                (ratings.asClient * stats.reviewsCount - oldRating + newRating) /
                    stats.reviewsCount;
        }
        user.ratings = ratings;
        user.stats = stats;
        await user.save();
    }
    async getMyReviewForJob(jobId, reviewerId) {
        const review = await this._reviewRepository.findOne({
            jobId: new mongoose_1.Types.ObjectId(jobId),
            reviewerId: new mongoose_1.Types.ObjectId(reviewerId),
        });
        if (!review)
            return null;
        return (0, review_mapper_1.mapReview)(review);
    }
    async getReviewsForUser(userId, role, page, limit) {
        if (![user_constants_1.UserRole.CLIENT, user_constants_1.UserRole.FREELANCER].includes(role)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "You are not allowed");
        }
        const filter = {
            revieweeId: new mongoose_1.Types.ObjectId(userId),
            isPublic: true,
        };
        if (role) {
            filter.revieweeRole = role;
        }
        const result = await this._reviewRepository.paginate(filter, {
            page, limit, sort: { createdAt: -1 }
        });
        return {
            data: result.data.map(review_mapper_1.mapReview),
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        };
    }
    async hasReviewed(jobId, reviewerId) {
        const review = await this._reviewRepository.findOne({
            jobId,
            reviewerId,
        });
        return !!review;
    }
}
exports.ReviewService = ReviewService;
