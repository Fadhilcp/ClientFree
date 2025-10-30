import express from 'express';
import { PlanController } from 'controllers/plan.controller';
import { PlanRepository } from 'repositories/plan.repository';
import { PlanService } from 'services/plan.service';

const planRouter = express.Router();

const planRepository = new PlanRepository();
const planService = new PlanService(planRepository);
const planController = new PlanController(planService);

planRouter.get('/plans',planController.getPlans.bind(planController));
planRouter.get('/:id',planController.getPlan.bind(planController));
planRouter.post('/',planController.createPlan.bind(planController));
planRouter.put('/:id',planController.updatePlan.bind(planController));
planRouter.delete('/:id',planController.deletePlan.bind(planController));
//need api to list all plan 

export default planRouter;