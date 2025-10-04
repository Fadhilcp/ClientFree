import { Router } from "express";

import { ProfileController } from "../controllers/profile.controller";
import { UserRepository } from "../repositories/user.repository";
import { ProfileService } from "../services/profile.service";
import { authMiddleware } from "middlewares/authMiddleware";


const profileRouter = Router();

const userRepository = new UserRepository();
const profileService = new ProfileService(userRepository);
const profileController = new ProfileController(profileService)


profileRouter.get('/me',authMiddleware,profileController.getMe.bind(profileController));
profileRouter.patch('/me',authMiddleware,profileController.update.bind(profileController));
profileRouter.get('/:id',profileController.getById.bind(profileController));
profileRouter.get('/',profileController.getAll.bind(profileController));

export default profileRouter;