import { PaymentController } from "../controllers/payment.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/authorizeRole";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { MongooseSessionProvider } from "../repositories/db/session-provider";
import { JobRepository } from "../repositories/job.repository";
import { JobAssignmentRepository } from "../repositories/jobAssignment.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { WalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionRepository } from "../repositories/walletTransaction.repository";
import { PaymentService } from "../services/payment.service";
import { UserRole } from "constants/user.constants";
import { ChatService } from "services/chat.service";
import { ChatRepository } from "repositories/chat.repository";
import { SubscriptionRepository } from "repositories/subscription.repository";
import { PlanRepository } from "repositories/plan.repository";
import { RevenueRepository } from "repositories/revenue.repository";
import { UserRepository } from "repositories/user.repository";
import { SubscriptionService } from "services/subscription.service";

const paymentRepository = new PaymentRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const jobRepository = new JobRepository();
const walletRepository = new WalletRepository();
const walletTransactionRepository = new WalletTransactionRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider();

//=======================
const subscriptionRepository = new SubscriptionRepository();
const planRepository = new PlanRepository();
const revenueRepository = new RevenueRepository();
const userRepository = new UserRepository();

const subscriptionService = new SubscriptionService(
    subscriptionRepository, 
    planRepository, 
    userRepository, 
    paymentRepository, 
    revenueRepository,
    sessionProvider,
);

const chatRepository = new ChatRepository();

const chatService = new ChatService(chatRepository, subscriptionService, jobRepository);
// ======================

const paymentService = new PaymentService(
    paymentRepository, 
    jobAssignmentRepository,
    jobRepository,
    walletRepository,
    walletTransactionRepository,
    sessionProvider,
    chatService,
    userRepository
);

const paymentController = new PaymentController(paymentService);

const paymentRouter = Router();

paymentRouter.use(authMiddleware, verifyUserNotBanned);

paymentRouter.post('/milestones/:assignmentId/:milestoneId/fund',authorizeRole(UserRole.CLIENT),
    paymentController.createOrder.bind(paymentController)
);
paymentRouter.get('/disputes',paymentController.getAllDisputes.bind(paymentController));

paymentRouter.get('/',authorizeRole(UserRole.ADMIN),paymentController.getAllPayments.bind(paymentController));

paymentRouter.post("/withdraw",paymentController.withdraw.bind(paymentController));
paymentRouter.get("/withdrawals",paymentController.getWithdrawals.bind(paymentController));
paymentRouter.get("/admin/withdrawals",authorizeRole(UserRole.ADMIN),paymentController.getAllWithdrawals.bind(paymentController));

paymentRouter.get('/:paymentId/dispute',paymentController.getDisputeById.bind(paymentController));
paymentRouter.post('/:paymentId/refund',paymentController.refund.bind(paymentController));
paymentRouter.post('/:paymentId/release',paymentController.release.bind(paymentController));

export default paymentRouter;