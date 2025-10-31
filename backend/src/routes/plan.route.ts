import express from 'express';
import { PlanController } from 'controllers/plan.controller';
import { PlanRepository } from 'repositories/plan.repository';
import { PlanService } from 'services/plan.service';
import { authMiddleware } from 'middlewares/authMiddleware';

const planRouter = express.Router();

const planRepository = new PlanRepository();
const planService = new PlanService(planRepository);
const planController = new PlanController(planService);

planRouter.get('/',authMiddleware,planController.getPlans.bind(planController));
planRouter.get('/:id',authMiddleware,planController.getPlan.bind(planController));
planRouter.post('/',authMiddleware,planController.createPlan.bind(planController));
planRouter.put('/:id',authMiddleware,planController.updatePlan.bind(planController));
planRouter.delete('/:id',authMiddleware,planController.deletePlan.bind(planController));
//need api to list all plan 

export default planRouter;