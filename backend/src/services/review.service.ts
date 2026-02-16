import { IReviewRepository } from "../repositories/interfaces/IReviewRepository";
import { IReviewService } from "./interface/IReviewService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IJobRepository } from "../repositories/interfaces/IJobRepository";
import { IJobAssignmentRepository } from "../repositories/interfaces/IJobAssignmentRepository";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { FilterQuery, Types } from "mongoose";
import { IReviewDocument } from "../types/review.type";
import { UserRole } from "../constants/user.constants";
import { CreateReviewInput, ReviewDto } from "../dtos/review.dto";
import { mapReview } from "mappers/review.mapper";
import { PaginatedResult } from "types/pagination";

export class ReviewService implements IReviewService{

    constructor(
        private _reviewRepository: IReviewRepository,
        private _userRepository: IUserRepository,
        private _jobRepository: IJobRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
    ){};

    async createReview({
        jobId,
        reviewerId,
        rating,
        title,
        comment,
    }: CreateReviewInput): Promise<ReviewDto> {
        
        const job = await this._jobRepository.findById(jobId);
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);

        if(job.status !== "completed") {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Job is not completed");
        }

        const existingReview = await this._reviewRepository.findOne({
            jobId,
            reviewerId,
        });

        if (existingReview) {
            throw createHttpError(HttpStatus.CONFLICT, "You have already reviewed this job");
        }

        const assignment = await this._jobAssignmentRepository.findOne({
            jobId,
            status: "completed"
        });

        if(!assignment) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Job assignment not completed");
        }

        let reviewerRole: "client" | "freelancer";
        let revieweeRole: "client" | "freelancer";
        let revieweeId: Types.ObjectId;

        if (job.clientId.equals(reviewerId)) {

            reviewerRole = "client";
            revieweeRole = "freelancer";
            revieweeId = new Types.ObjectId(assignment.freelancerId);

        } else if (new Types.ObjectId(assignment.freelancerId).equals(reviewerId)) {

            reviewerRole = "freelancer";
            revieweeRole = "client";
            revieweeId = job.clientId;
            
        } else {
            throw createHttpError(HttpStatus.FORBIDDEN, "You are not part of this job");
        }

        const review = await this._reviewRepository.create({
            jobId,
            reviewerId: new Types.ObjectId(reviewerId),
            revieweeId,
            reviewerRole,
            revieweeRole,
            rating,
            title,
            comment,
        });

        await this._updateUserRating(revieweeId, revieweeRole, rating);

        return mapReview(review);
    }

    private async _updateUserRating(
        userId: Types.ObjectId,
        role: "client" | "freelancer",
        newRating: number
    ): Promise<void> {
        const user = await this._userRepository.findById(userId.toString());

        if (!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        const ratings = user.ratings ?? { asClient: 0, asFreelancer: 0 };
        const stats = user.stats ?? { reviewsCount: 0 };

        const asClient = ratings.asClient ?? 0;
        const asFreelancer = ratings.asFreelancer ?? 0;
        const count = stats.reviewsCount ?? 0;

        if (role === "freelancer") {
            ratings.asFreelancer = (asFreelancer * count + newRating) / (count + 1);
        } else {
            ratings.asClient = (asClient * count + newRating) / (count + 1);
        }

        stats.reviewsCount = count + 1;

        user.ratings = ratings;
        user.stats = stats;

        await user.save();
    }

    async editReview(
        reviewId: string,
        reviewerId: string,
        rating: number,
        title?: string,
        comment?: string
    ): Promise<ReviewDto> {

        const review = await this._reviewRepository.findById(reviewId);
        if (!review) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Review not found");
        }

        if (!review.reviewerId.equals(reviewerId)) {
            throw createHttpError(HttpStatus.FORBIDDEN, "Not allowed to edit this review");
        }

        const oldRating = review.rating;

        review.rating = rating;
        review.title = title;
        review.comment = comment;
        review.editedAt = new Date();

        await review.save();

        await this._recalculateUserRatingOnEdit(
            review.revieweeId,
            review.revieweeRole,
            oldRating,
            rating
        );

        return mapReview(review);
    }

    private async _recalculateUserRatingOnEdit(
        userId: Types.ObjectId,
        role: "client" | "freelancer",
        oldRating: number,
        newRating: number
    ): Promise<void> {

        const user = await this._userRepository.findById(userId.toString());
        if (!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        const ratings = {
            asClient: user.ratings?.asClient ?? 0,
            asFreelancer: user.ratings?.asFreelancer ?? 0,
        };

        const stats = {
            reviewsCount: user.stats?.reviewsCount ?? 0,
        };

        if (stats.reviewsCount <= 0) return;

        if (role === "freelancer") {
            ratings.asFreelancer =
                (ratings.asFreelancer * stats.reviewsCount - oldRating + newRating) /
                stats.reviewsCount;
        } else {
            ratings.asClient =
                (ratings.asClient * stats.reviewsCount - oldRating + newRating) /
                stats.reviewsCount;
        }

        user.ratings = ratings;
        user.stats = stats;

        await user.save();
    }

    async getMyReviewForJob(jobId: string, reviewerId: string): Promise<ReviewDto | null> {

        const review = await this._reviewRepository.findOne({
            jobId: new Types.ObjectId(jobId),
            reviewerId: new Types.ObjectId(reviewerId),
        });

        if (!review) return null;

        return mapReview(review);
    }


    async getReviewsForUser(userId: string, role: UserRole, page: number, limit: number): Promise<PaginatedResult<ReviewDto>> {

        if(![UserRole.CLIENT, UserRole.FREELANCER].includes(role)) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "You are not allowed");
        }
        
        const filter: FilterQuery<IReviewDocument> = {
            revieweeId: new Types.ObjectId(userId),
            isPublic: true,
        };

        if(role) {
            filter.revieweeRole = role;
        }

        const result = await this._reviewRepository.paginate(filter, { 
            page, limit, sort: { createdAt: -1 }
        });

        return {
            data: result.data.map(mapReview),
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        }
    }

    async hasReviewed(jobId: string, reviewerId: string): Promise<boolean> {
        const review = await this._reviewRepository.findOne({
            jobId,
            reviewerId,
        });

        return !!review;
    }

}