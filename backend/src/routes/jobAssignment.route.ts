import { JobAssignmentController } from "controllers/jobAssignment.controller";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { JobAssignmentService } from "services/jobAssignment.service";
import { Router } from "express";

const jobAssignmentRepository = new JobAssignmentRepository();
const jobAssignmentService = new JobAssignmentService(jobAssignmentRepository);
const jobAssignmentController = new JobAssignmentController(jobAssignmentService);

const assignmentRouter = Router();

assignmentRouter.get('/job/:id',jobAssignmentController.getAssignments.bind(jobAssignmentController));
assignmentRouter.post('/:id/milestones',jobAssignmentController.addMilestones.bind(jobAssignmentController));

export default assignmentRouter;