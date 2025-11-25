import { JobController } from "controllers/job.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { JobRepository } from "repositories/job.repository";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { ProposalRepository } from "repositories/proposalInvitation.repository";
import { JobService } from "services/job.service";

const jobRouter = Router();

const jobRepository = new JobRepository();
const proposalRepository = new ProposalRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const jobSerivce = new JobService(jobRepository, proposalRepository, jobAssignmentRepository);
const jobController = new JobController(jobSerivce);

jobRouter.post('/',authMiddleware,jobController.createJob.bind(jobController));
jobRouter.get('/',authMiddleware,jobController.getAll.bind(jobController));
jobRouter.get('/my',authMiddleware,jobController.getClientJobs.bind(jobController));
jobRouter.patch('/jobs/:id/status',authMiddleware,jobController.changeStatus.bind(jobController));
jobRouter.post('/jobs/:id/activate',authMiddleware,jobController.startJob.bind(jobController));
jobRouter.get('/:id',authMiddleware,jobController.getById.bind(jobController));
jobRouter.put('/:id',authMiddleware,jobController.update.bind(jobController));
jobRouter.delete('/:id',authMiddleware,jobController.delete.bind(jobController));

export default jobRouter;