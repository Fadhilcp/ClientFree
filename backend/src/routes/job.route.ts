import { JobController } from "../controllers/job.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { ClarificationBoardRepository } from "../repositories/clarificationBoard.repository";
import { MongooseSessionProvider } from "../repositories/db/session-provider";
import { JobRepository } from "../repositories/job.repository";
import { JobAssignmentRepository } from "../repositories/jobAssignment.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { ProposalRepository } from "../repositories/proposalInvitation.repository";
import { UserRepository } from "../repositories/user.repository";
import { WalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionRepository } from "../repositories/walletTransaction.repository";
import { JobService } from "../services/job.service";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationRecipientRepository } from "../repositories/notificationRecipient.repository";
import { NotificationService } from "../services/notification.service";

const jobRouter = Router();

const jobRepository = new JobRepository();
const proposalRepository = new ProposalRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const userRepository = new UserRepository();
const clarificationBoardRepository = new ClarificationBoardRepository();
const paymentRepository = new PaymentRepository();
const walletRepository = new WalletRepository();
const walletTransactionRepository = new WalletTransactionRepository();
const sessionProvider = new MongooseSessionProvider;
// notification
const notificationRepository = new NotificationRepository();
const notificationRecipientRepository = new NotificationRecipientRepository();

const notificationService = new NotificationService(
    notificationRepository,
    notificationRecipientRepository,
    userRepository,
);

const jobSerivce = new JobService(
    jobRepository, 
    proposalRepository, 
    jobAssignmentRepository, 
    userRepository,
    clarificationBoardRepository,
    paymentRepository,
    walletRepository,
    walletTransactionRepository,
    sessionProvider,
    notificationService
);

const jobController = new JobController(jobSerivce);

jobRouter.use(authMiddleware, verifyUserNotBanned);

jobRouter.post('/',jobController.createJob.bind(jobController));
jobRouter.get('/',jobController.getAll.bind(jobController));
jobRouter.get('/client/me',jobController.getClientJobs.bind(jobController));

jobRouter.get('/interested',jobController.getInterestedJobs.bind(jobController));
jobRouter.post('/:jobId/interest',jobController.addJobInterest.bind(jobController));
jobRouter.delete('/:jobId/interest',jobController.removeJobInterest.bind(jobController));

jobRouter.get('/freelancer/me',jobController.getFreelancerJobs.bind(jobController));
jobRouter.patch('/:id/status',jobController.changeStatus.bind(jobController));
jobRouter.post('/:id/activate',jobController.startJob.bind(jobController));
jobRouter.get('/:id',jobController.getById.bind(jobController));
jobRouter.patch('/:jobId/cancel',jobController.cancelJob.bind(jobController));
jobRouter.put('/:id',jobController.update.bind(jobController));
jobRouter.delete('/:id',jobController.delete.bind(jobController));

export default jobRouter;