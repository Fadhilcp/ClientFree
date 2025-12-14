import { JobAssignmentController } from "controllers/jobAssignment.controller";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { JobAssignmentService } from "services/jobAssignment.service";
import { Router } from "express";
import { PaymentRepository } from "repositories/payment.repository";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import upload from "utils/uploader-s3.util";


const jobAssignmentRepository = new JobAssignmentRepository();
const paymentRepository = new PaymentRepository();
const jobAssignmentService = new JobAssignmentService(jobAssignmentRepository, paymentRepository);
const jobAssignmentController = new JobAssignmentController(jobAssignmentService);

const assignmentRouter = Router();

assignmentRouter.use(authMiddleware, verifyUserNotBanned);

assignmentRouter.get('/job/:jobId',jobAssignmentController.getAssignments.bind(jobAssignmentController));
assignmentRouter.post('/:assignmentId/milestones',jobAssignmentController.addMilestones.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/cancel',jobAssignmentController.cancelMilestone.bind(jobAssignmentController));
assignmentRouter.get('/approved',jobAssignmentController.getApproved.bind(jobAssignmentController));

assignmentRouter.post('/:assignmentId/:milestoneId/submit',upload.array("files"),jobAssignmentController.submit.bind(jobAssignmentController));
assignmentRouter.get('/:assignmentId/:milestoneId/file/:key',jobAssignmentController.downloadFile.bind(jobAssignmentController));

assignmentRouter.patch('/:assignmentId/:milestoneId/request-changes',jobAssignmentController.requestChange.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/approve',jobAssignmentController.approve.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/dispute',jobAssignmentController.dispute.bind(jobAssignmentController));

assignmentRouter.patch('/:assignmentId/milestones/:milestoneId',jobAssignmentController.updateMilestone.bind(jobAssignmentController));


export default assignmentRouter;