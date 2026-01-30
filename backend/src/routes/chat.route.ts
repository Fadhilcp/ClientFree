import { ChatController } from "controllers/chat.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { ChatRepository } from "repositories/chat.repository";
import { MongooseSessionProvider } from "repositories/db/session-provider";
import { JobRepository } from "repositories/job.repository";
import { PaymentRepository } from "repositories/payment.repository";
import { PlanRepository } from "repositories/plan.repository";
import { RevenueRepository } from "repositories/revenue.repository";
import { SubscriptionRepository } from "repositories/subscription.repository";
import { UserRepository } from "repositories/user.repository";
import { ChatService } from "services/chat.service";
import { SubscriptionService } from "services/subscription.service";

const chatRouter = Router();

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

const jobRepository = new JobRepository();

const chatRepository = new ChatRepository();

const chatService = new ChatService(chatRepository, subscriptionService, jobRepository);

const chatController = new ChatController(chatService);

chatRouter.use(authMiddleware, verifyUserNotBanned);

chatRouter.post('/',chatController.getOrCreateChat.bind(chatController));
chatRouter.get('/my',chatController.getMyChats.bind(chatController));
chatRouter.patch('/:chatId/block-status',chatController.updateChatBlockStatus.bind(chatController));

export default chatRouter;