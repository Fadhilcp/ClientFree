import { ClarificationController } from "controllers/clarification.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { ClarificationBoardRepository } from "repositories/clarificationBoard.repository";
import { ClarificationMessageRepository } from "repositories/clarificationMessage.repository";
import { JobRepository } from "repositories/job.repository";
import { ClarificationService } from "services/clarification.service";

const clarificationRouter = Router();

const clarificationBoardRepository = new ClarificationBoardRepository();
const clarificationMessageRepository = new ClarificationMessageRepository();
const jobRepository = new JobRepository();

const clarificationService = new ClarificationService(
    clarificationBoardRepository,
    clarificationMessageRepository,
    jobRepository,
);
const clarificationController = new ClarificationController(clarificationService);

clarificationRouter.use(authMiddleware, verifyUserNotBanned);

clarificationRouter.post('/:jobId/message',clarificationController.addMessage.bind(clarificationController));
clarificationRouter.get('/:jobId',clarificationController.getBoard.bind(clarificationController));
clarificationRouter.patch('/:jobId/close',clarificationController.closeBoard.bind(clarificationController));

export default clarificationRouter;