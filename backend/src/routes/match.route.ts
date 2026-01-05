import { MatchController } from "../controllers/match.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { MongooseSessionProvider } from "../repositories/db/session-provider";
import { JobRepository } from "../repositories/job.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { PlanRepository } from "../repositories/plan.repository";
import { RevenueRepository } from "../repositories/revenue.repository";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { UserRepository } from "../repositories/user.repository";
import { MatchService } from "../services/match.service";
import { SubscriptionService } from "../services/subscription.service";

const matchRouter = Router();

const jobRepository = new JobRepository();
const userRepository = new UserRepository();

const subscriptionRepository = new SubscriptionRepository();
const planRepository = new PlanRepository();
const paymentRepository = new PaymentRepository();
const revenueRepository = new RevenueRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider();
// subscription service
const subscriptionService = new SubscriptionService(
    subscriptionRepository, 
    planRepository, 
    userRepository, 
    paymentRepository, 
    revenueRepository,
    sessionProvider,
);

const matchService = new MatchService(jobRepository, userRepository, subscriptionService);

const matchController = new MatchController(matchService);

matchRouter.use(authMiddleware, verifyUserNotBanned);

matchRouter.get("/jobs",matchController.getBestMatchJobs.bind(matchController));
matchRouter.get("/freelancers/:jobId",matchController.getBestMatchFreelancer.bind(matchController));

export default matchRouter;