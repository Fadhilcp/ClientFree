import { ReviewDto } from "../dtos/review.dto";
import { IReviewDocument } from "../types/review.type";

export function mapReview(review: IReviewDocument): ReviewDto {
  return {
    id: review._id.toString(),

    jobId: review.jobId.toString(),

    reviewerId: review.reviewerId.toString(),
    revieweeId: review.revieweeId.toString(),

    reviewerRole: review.reviewerRole,
    revieweeRole: review.revieweeRole,

    rating: review.rating,

    title: review.title,
    comment: review.comment,

    isPublic: review.isPublic,

    editedAt: review.editedAt ?? null,
    reportedAt: review.reportedAt ?? null,

    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}
