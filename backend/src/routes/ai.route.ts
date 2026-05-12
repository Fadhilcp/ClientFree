import { Router } from "express";
import { AiService } from "../services/ai.service";
import { AiController } from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";

const aiRouter = Router();

const aiService = new AiService();
const aiController = new AiController(aiService);

aiRouter.use(authMiddleware, verifyUserNotBanned);

aiRouter.post('/suggest-job',aiController.getJobSuggestions.bind(aiController));

export default aiRouter;