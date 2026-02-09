export interface CreateReviewInput {
  jobId: string;
  reviewerId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export type ReviewRole = "client" | "freelancer";

export interface ReviewDto {
  id: string;

  jobId: string;

  reviewerId: string;
  revieweeId: string;

  reviewerRole: ReviewRole;
  revieweeRole: ReviewRole;

  rating: number;

  title?: string;
  comment?: string;

  isPublic: boolean;

  editedAt: Date | null;
  reportedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
