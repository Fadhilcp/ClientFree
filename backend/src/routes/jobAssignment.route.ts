import { JobAssignmentController } from "../controllers/jobAssignment.controller";
import { JobAssignmentRepository } from "../repositories/jobAssignment.repository";
import { JobAssignmentService } from "../services/jobAssignment.service";
import { Router } from "express";
import { PaymentRepository } from "../repositories/payment.repository";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import upload from "../utils/uploader-s3.util";
import { WalletService } from "../services/wallet.service";
import { WalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionRepository } from "../repositories/walletTransaction.repository";
import { authorizeRole } from "../middlewares/authorizeRole";
import { UserRole } from "../constants/user.constants";

const walletRepository = new WalletRepository();
const walletTransactionRepository = new WalletTransactionRepository();
const paymentRepository = new PaymentRepository();

const walletService = new WalletService(
    walletRepository, 
    walletTransactionRepository,
);

const jobAssignmentRepository = new JobAssignmentRepository();
const jobAssignmentService = new JobAssignmentService(jobAssignmentRepository, paymentRepository, walletService);

const jobAssignmentController = new JobAssignmentController(jobAssignmentService);

const assignmentRouter = Router();

assignmentRouter.use(authMiddleware, verifyUserNotBanned);

assignmentRouter.get('/job/:jobId',jobAssignmentController.getAssignments.bind(jobAssignmentController));
assignmentRouter.post('/:assignmentId/milestones',authorizeRole(UserRole.CLIENT),jobAssignmentController.addMilestones.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/cancel',authorizeRole(UserRole.CLIENT),jobAssignmentController.cancelMilestone.bind(jobAssignmentController));
assignmentRouter.get('/approved',jobAssignmentController.getApproved.bind(jobAssignmentController));

assignmentRouter.get('/escrow-milestones',authorizeRole(UserRole.CLIENT),jobAssignmentController.getClientEscrowMilestones.bind(jobAssignmentController));

assignmentRouter.get('/admin/escrow-milestones',authorizeRole(UserRole.ADMIN),jobAssignmentController.getAllEscrowMilestones.bind(jobAssignmentController));

assignmentRouter.get('/:assignmentId/:milestoneId/approved',jobAssignmentController.getApprovedMilestoneDetail.bind(jobAssignmentController));

assignmentRouter.post('/:assignmentId/:milestoneId/submit',upload.array("files"),jobAssignmentController.submit.bind(jobAssignmentController));
assignmentRouter.get('/:assignmentId/:milestoneId/file/:key',jobAssignmentController.downloadFile.bind(jobAssignmentController));

assignmentRouter.patch('/:assignmentId/:milestoneId/request-changes',authorizeRole(UserRole.CLIENT),jobAssignmentController.requestChange.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/approve',authorizeRole(UserRole.CLIENT),jobAssignmentController.approve.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/dispute',jobAssignmentController.dispute.bind(jobAssignmentController));

assignmentRouter.patch('/:assignmentId/milestones/:milestoneId',jobAssignmentController.updateMilestone.bind(jobAssignmentController));



export default assignmentRouter;