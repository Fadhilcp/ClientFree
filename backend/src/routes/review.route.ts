import { ReviewController } from "controllers/review.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { JobRepository } from "repositories/job.repository";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { ReviewRepository } from "repositories/review.repository";
import { UserRepository } from "repositories/user.repository";
import { ReviewService } from "services/review.service";

const reviewRouter = Router();

const reviewRepository = new ReviewRepository();
const userRepository = new UserRepository();
const jobRepository = new JobRepository();
const jobAssignmentRepository = new JobAssignmentRepository();

const reviewService = new ReviewService(
    reviewRepository,
    userRepository,
    jobRepository,
    jobAssignmentRepository
);

const reviewController = new ReviewController(reviewService);

reviewRouter.use(authMiddleware, verifyUserNotBanned);

reviewRouter.post("/",reviewController.createReview.bind(reviewController));
reviewRouter.get("/user/:userId",reviewController.getReviewsForUser.bind(reviewController));
reviewRouter.get("/job/:jobId/has-reviewed",reviewController.hasReviewed.bind(reviewController));

export default reviewRouter;