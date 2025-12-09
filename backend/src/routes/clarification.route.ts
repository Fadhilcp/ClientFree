import { ClarificationController } from "controllers/clarification.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
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

clarificationRouter.post('/:jobId/message',authMiddleware,clarificationController.addMessage.bind(clarificationController));
clarificationRouter.get('/:jobId',authMiddleware,clarificationController.getBoard.bind(clarificationController));
clarificationRouter.patch('/:jobId/close',authMiddleware,clarificationController.closeBoard.bind(clarificationController));

export default clarificationRouter;