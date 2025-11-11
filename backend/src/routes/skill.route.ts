import { Router } from "express";

import { SkillRepository } from "repositories/skillRepository";
import { UserRepository } from "repositories/user.repository";
import { SkillService } from "services/skill.service";
import { SkillController } from "controllers/skill.controller";
import { authMiddleware } from "middlewares/authMiddleware";

const skillRouter = Router()

const userRepository = new UserRepository();
const skillRepository = new SkillRepository();
const skillService = new SkillService(skillRepository, userRepository);
const skillController = new SkillController(skillService);

skillRouter.post('/',authMiddleware,skillController.create.bind(skillController));
skillRouter.get('/active',authMiddleware,skillController.getActive.bind(skillController));
skillRouter.get('/',authMiddleware,skillController.getAll.bind(skillController));
skillRouter.patch('/:id',authMiddleware,skillController.update.bind(skillController));
skillRouter.delete('/:id',authMiddleware,skillController.delete.bind(skillController));

export default skillRouter;