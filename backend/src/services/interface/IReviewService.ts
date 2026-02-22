import { PaginatedResult } from "../../types/pagination";
import { UserRole } from "../../constants/user.constants";
import { CreateReviewInput, ReviewDto } from "../../dtos/review.dto";

export interface IReviewService {
    createReview({
        jobId,
        reviewerId,
        rating,
        title,
        comment,
    }: CreateReviewInput): Promise<ReviewDto>;
    editReview(
        reviewId: string,
        reviewerId: string,
        rating: number,
        title?: string,
        comment?: string
    ): Promise<ReviewDto>;
    getMyReviewForJob(jobId: string, reviewerId: string): Promise<ReviewDto | null>;
    getReviewsForUser(
        userId: string, role: UserRole, page: number, limit: number
    ): Promise<PaginatedResult<ReviewDto>>;
    hasReviewed(jobId: string, reviewerId: string): Promise<boolean>;
}