import express from 'express'
import { SubscriptionRepository } from '../repositories/subscription.repository'
import { SubscriptionService } from '../services/subscription.service'
import { SubscriptionController } from '../controllers/subscription.controller'
import { PlanRepository } from '../repositories/plan.repository';
import { authMiddleware } from '../middlewares/authMiddleware';
import { PaymentRepository } from '../repositories/payment.repository';
import { RevenueRepository } from '../repositories/revenue.repository';
import { UserRepository } from '../repositories/user.repository';
import { verifyUserNotBanned } from '../middlewares/verifyUserNotBanned.middleware';
import { MongooseSessionProvider } from '../repositories/db/session-provider';
import { authorizeRole } from 'middlewares/authorizeRole';

const subscriptionRouter = express.Router()

const subscriptionRepository = new SubscriptionRepository();
const planRepository = new PlanRepository();
const paymentRepository = new PaymentRepository();
const revenueRepository = new RevenueRepository();
const userRepository = new UserRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider();

const subscriptionService = new SubscriptionService(
    subscriptionRepository, 
    planRepository, 
    userRepository, 
    paymentRepository, 
    revenueRepository,
    sessionProvider,
);
const subscriptionController = new SubscriptionController(subscriptionService);

subscriptionRouter.use(authMiddleware, verifyUserNotBanned);

subscriptionRouter.get('/',authorizeRole("admin"),subscriptionController.getAllSubscription.bind(subscriptionController))
subscriptionRouter.post('/',subscriptionController.createSubscription.bind(subscriptionController));
subscriptionRouter.get('/me',subscriptionController.getActiveFeatures.bind(subscriptionController));
subscriptionRouter.get('/history',subscriptionController.getMySubscriptions.bind(subscriptionController));
subscriptionRouter.patch('/cancel',subscriptionController.cancelSubscription.bind(subscriptionController));
subscriptionRouter.get('/current',subscriptionController.getCurrentPlan.bind(subscriptionController));

export default subscriptionRouter;