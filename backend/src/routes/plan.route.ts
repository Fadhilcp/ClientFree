import express from 'express';
import { PlanController } from '../controllers/plan.controller';
import { PlanRepository } from '../repositories/plan.repository';
import { PlanService } from '../services/plan.service';
import { authMiddleware } from '../middlewares/authMiddleware';
import { verifyUserNotBanned } from '../middlewares/verifyUserNotBanned.middleware';

const planRouter = express.Router();

const planRepository = new PlanRepository();
const planService = new PlanService(planRepository);
const planController = new PlanController(planService);

planRouter.use(authMiddleware, verifyUserNotBanned);

planRouter.get('/',planController.getAllPlans.bind(planController));
planRouter.get('/active',planController.getActivePlans.bind(planController));
planRouter.get('/:id',planController.getPlan.bind(planController));
planRouter.post('/',planController.createPlan.bind(planController));
planRouter.put('/:id',planController.updatePlan.bind(planController));
planRouter.delete('/:id',planController.deletePlan.bind(planController));

export default planRouter;