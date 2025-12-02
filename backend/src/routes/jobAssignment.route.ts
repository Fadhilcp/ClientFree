import { JobAssignmentController } from "controllers/jobAssignment.controller";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { JobAssignmentService } from "services/jobAssignment.service";
import { Router } from "express";
import { PaymentRepository } from "repositories/payment.repository";
import { authMiddleware } from "middlewares/authMiddleware";
import multer from "multer";
const upload = multer({ dest: "uploads/" });


const jobAssignmentRepository = new JobAssignmentRepository();
const paymentRepository = new PaymentRepository();
const jobAssignmentService = new JobAssignmentService(jobAssignmentRepository, paymentRepository);
const jobAssignmentController = new JobAssignmentController(jobAssignmentService);

const assignmentRouter = Router();

assignmentRouter.get('/job/:jobId',authMiddleware,jobAssignmentController.getAssignments.bind(jobAssignmentController));
assignmentRouter.post('/:assignmentId/milestones',authMiddleware,jobAssignmentController.addMilestones.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/cancel',authMiddleware,jobAssignmentController.cancelMilestone.bind(jobAssignmentController));

assignmentRouter.post('/:assignmentId/:milestoneId/submit',authMiddleware,upload.array("files"),jobAssignmentController.submit.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/request-changes',authMiddleware,jobAssignmentController.requestChange.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/approve',authMiddleware,jobAssignmentController.approve.bind(jobAssignmentController));
assignmentRouter.post('/:assignmentId/:milestoneId/dispute',authMiddleware,jobAssignmentController.dispute.bind(jobAssignmentController));

assignmentRouter.patch('/:assignmentId/milestones/:milestoneId',authMiddleware,jobAssignmentController.updateMilestone.bind(jobAssignmentController));


export default assignmentRouter;