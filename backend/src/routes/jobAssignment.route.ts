import { JobAssignmentController } from "controllers/jobAssignment.controller";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { JobAssignmentService } from "services/jobAssignment.service";
import { Router } from "express";
import { PaymentRepository } from "repositories/payment.repository";

const jobAssignmentRepository = new JobAssignmentRepository();
const paymentRepository = new PaymentRepository();
const jobAssignmentService = new JobAssignmentService(jobAssignmentRepository, paymentRepository);
const jobAssignmentController = new JobAssignmentController(jobAssignmentService);

const assignmentRouter = Router();

assignmentRouter.get('/job/:jobId',jobAssignmentController.getAssignments.bind(jobAssignmentController));
assignmentRouter.post('/:assignmentId/milestones',jobAssignmentController.addMilestones.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/milestones/:milestoneId/cancel',jobAssignmentController.cancelMilestone.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/milestones/:milestoneId',jobAssignmentController.updateMilestone.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/request-changes',jobAssignmentController.requestChange.bind(jobAssignmentController));
assignmentRouter.patch('/:assignmentId/:milestoneId/approve',jobAssignmentController.approve.bind(jobAssignmentController));
assignmentRouter.post('/:assignmentId/:milestoneId/dispute',jobAssignmentController.dispute.bind(jobAssignmentController));

export default assignmentRouter;