import express from 'express'
import { SubscriptionRepository } from 'repositories/subscription.repository'
import { SubscriptionService } from 'services/subscription.service'
import { SubscriptionController } from 'controllers/subscription.controller'
import { PlanRepository } from 'repositories/plan.repository';
import { authMiddleware } from 'middlewares/authMiddleware';
import { PaymentRepository } from 'repositories/payment.repository';
import { RevenueRepository } from 'repositories/revenue.repository';

const subscriptionRouter = express.Router()

const subscriptionRepository = new SubscriptionRepository();
const planRepository = new PlanRepository();
const paymentRepository = new PaymentRepository();
const revenueRepository = new RevenueRepository();

const subscriptionService = new SubscriptionService(subscriptionRepository, planRepository, paymentRepository, revenueRepository);
const subscriptionController = new SubscriptionController(subscriptionService);

subscriptionRouter.post('/', authMiddleware,subscriptionController.createSubscription.bind(subscriptionController));
subscriptionRouter.post('/verify', authMiddleware,subscriptionController.verifySubscription.bind(subscriptionController));
subscriptionRouter.patch('/cancel',subscriptionController.cancelSubscription.bind(subscriptionController));
subscriptionRouter.get('/current', authMiddleware,subscriptionController.getCurrentPlan.bind(subscriptionController));

export default subscriptionRouter;