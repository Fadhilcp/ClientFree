import { JobAssignmentController } from "controllers/jobAssignment.controller";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { JobAssignmentService } from "services/jobAssignment.service";
import { Router } from "express";
import { PaymentRepository } from "repositories/payment.repository";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import upload from "utils/uploader-s3.util";
import { WalletService } from "services/wallet.service";
import { WalletRepository } from "repositories/wallet.repository";
import { WalletTransactionRepository } from "repositories/walletTransaction.repository";
import { MongooseSessionProvider } from "repositories/db/session-provider";
import { authorizeRole } from "middlewares/authorizeRole";

const walletRepository = new WalletRepository();
const walletTransactionRepository = new WalletTransactionRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider();

const walletService = new WalletService(walletRepository, walletTransactionRepository, sessionProvider);

const jobAssignmentRepository = new JobAssignmentRepository();
const paymentRepository = new PaymentRepository();
const jobAssignmentService = new JobAssignmentService(jobAssignmentRepository, paymentRepository, walletService);

const jobAssignmentController = new JobAssignmentController(jobAssignmentService);

const assignmentRouter = Router();

assignmentRouter.use(authMiddleware, verifyUserNotBanned);

assignmentRouter.get('/job/:jobId',jobAssignmentController.getAssignments.bind(jobAssignmentController));
assignmentRouter.post('/:assignmentId/milestones',authorizeRole("client"),jobAssignmentController.addMilestones.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/cancel',authorizeRole("client"),jobAssignmentController.cancelMilestone.bind(jobAssignmentController));
assignmentRouter.get('/approved',jobAssignmentController.getApproved.bind(jobAssignmentController));

assignmentRouter.get('/escrow-milestones',authorizeRole("client"),jobAssignmentController.getClientEscrowMilestones.bind(jobAssignmentController));

assignmentRouter.get('/:assignmentId/:milestoneId/approved',jobAssignmentController.getApprovedMilestoneDetail.bind(jobAssignmentController));

assignmentRouter.post('/:assignmentId/:milestoneId/submit',upload.array("files"),jobAssignmentController.submit.bind(jobAssignmentController));
assignmentRouter.get('/:assignmentId/:milestoneId/file/:key',jobAssignmentController.downloadFile.bind(jobAssignmentController));

assignmentRouter.patch('/:assignmentId/:milestoneId/request-changes',authorizeRole("client"),jobAssignmentController.requestChange.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/approve',authorizeRole("client"),jobAssignmentController.approve.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/dispute',jobAssignmentController.dispute.bind(jobAssignmentController));

assignmentRouter.patch('/:assignmentId/milestones/:milestoneId',jobAssignmentController.updateMilestone.bind(jobAssignmentController));



export default assignmentRouter;