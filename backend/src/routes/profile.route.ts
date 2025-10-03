import { Router } from "express";

import { ProfileController } from "../controllers/profile.controller.js";
import { UserRepository } from "../repositories/user.repository.js";
import { ProfileService } from "../services/profile.service.js";
import { authMiddleware } from "../middlewares/verifyToken.js";


const profileRouter = Router();

const userRepository = new UserRepository();
const profileService = new ProfileService(userRepository);
const profileController = new ProfileController(profileService)


profileRouter.get('/me',authMiddleware,profileController.getMe.bind(profileController));
profileRouter.patch('/me',authMiddleware,profileController.update.bind(profileController));
profileRouter.get('/:id',profileController.getById.bind(profileController));
profileRouter.get('/',profileController.getAll.bind(profileController));

export default profileRouter;