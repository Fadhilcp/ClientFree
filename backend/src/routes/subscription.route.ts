import express from 'express'
import { SubscriptionRepository } from 'repositories/subscription.repository'
import { SubscriptionService } from 'services/subscription.service'
import { SubscriptionController } from 'controllers/subscription.controller'
import { PlanRepository } from 'repositories/plan.repository';

const subscriptionRepository = new SubscriptionRepository();
const planRepository = new PlanRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository, planRepository);
const subscriptionController = new SubscriptionController(subscriptionService);

const subscriptionRouter = express.Router()

subscriptionRouter.post('/subscribe', subscriptionController.createSubscription.bind(subscriptionController));
subscriptionRouter.get('/currentPlan', subscriptionController.getCurrentPlan.bind(subscriptionController));

export default subscriptionRouter;