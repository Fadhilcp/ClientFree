import { Router } from "express";

import { SkillRepository } from "repositories/skillRepository";
import { UserRepository } from "repositories/user.repository";
import { SkillService } from "services/skill.service";
import { SkillController } from "controllers/skill.controller";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyAdmin } from "middlewares/verifyAdmin";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";

const skillRouter = Router()

const userRepository = new UserRepository();
const skillRepository = new SkillRepository();
const skillService = new SkillService(skillRepository, userRepository);
const skillController = new SkillController(skillService);

skillRouter.get('/active',authMiddleware,skillController.getActive.bind(skillController));

skillRouter.use(authMiddleware, verifyAdmin, verifyUserNotBanned);

skillRouter.post('/',skillController.create.bind(skillController));
skillRouter.get('/',skillController.getAll.bind(skillController));
skillRouter.patch('/:id',skillController.update.bind(skillController));
skillRouter.delete('/:id',skillController.delete.bind(skillController));

export default skillRouter;