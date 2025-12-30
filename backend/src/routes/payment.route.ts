import { PaymentController } from "controllers/payment.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { authorizeRole } from "middlewares/authorizeRole";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { MongooseSessionProvider } from "repositories/db/session-provider";
import { JobRepository } from "repositories/job.repository";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { PaymentRepository } from "repositories/payment.repository";
import { WalletRepository } from "repositories/wallet.repository";
import { WalletTransactionRepository } from "repositories/walletTransaction.repository";
import { PaymentService } from "services/payment.service";

const paymentRepository = new PaymentRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const jobRepository = new JobRepository();
const walletRepository = new WalletRepository();
const walletTransactionRepository = new WalletTransactionRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider;

const paymentService = new PaymentService(
    paymentRepository, 
    jobAssignmentRepository, 
    jobRepository,
    walletRepository,
    walletTransactionRepository,
    sessionProvider
);

const paymentController = new PaymentController(paymentService);

const paymentRouter = Router();

paymentRouter.use(authMiddleware, verifyUserNotBanned);

paymentRouter.post('/milestones/:assignmentId/:milestoneId/fund',authorizeRole("client"),
    paymentController.createOrder.bind(paymentController)
);
paymentRouter.post('/verify',paymentController.verifyPayment.bind(paymentController));
paymentRouter.get('/disputes',paymentController.getAllDisputes.bind(paymentController));
paymentRouter.get('/:paymentId/dispute',paymentController.getDisputeById.bind(paymentController));
paymentRouter.post('/:paymentId/refund',paymentController.refund.bind(paymentController));
paymentRouter.post('/:paymentId/release',paymentController.release.bind(paymentController));

export default paymentRouter;