import { PaginatedResult } from "types/pagination";
import { UserRole } from "../../constants/user.constants";
import { CreateReviewInput, ReviewDto } from "dtos/review.dto";

export interface IReviewService {
    createReview({
        jobId,
        reviewerId,
        rating,
        title,
        comment,
    }: CreateReviewInput): Promise<ReviewDto>;
    getReviewsForUser(
        userId: string, role: UserRole, page: number, limit: number
    ): Promise<PaginatedResult<ReviewDto>>;
    hasReviewed(jobId: string, reviewerId: string): Promise<boolean>;
}