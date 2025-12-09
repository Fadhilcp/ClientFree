import { JobController } from "controllers/job.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { ClarificationBoardRepository } from "repositories/clarificationBoard.repository";
import { JobRepository } from "repositories/job.repository";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { ProposalRepository } from "repositories/proposalInvitation.repository";
import { UserRepository } from "repositories/user.repository";
import { JobService } from "services/job.service";

const jobRouter = Router();

const jobRepository = new JobRepository();
const proposalRepository = new ProposalRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const userRepository = new UserRepository();
const clarificationBoardRepository = new ClarificationBoardRepository();

const jobSerivce = new JobService(
    jobRepository, 
    proposalRepository, 
    jobAssignmentRepository, 
    userRepository,
    clarificationBoardRepository,
);

const jobController = new JobController(jobSerivce);

jobRouter.post('/',authMiddleware,jobController.createJob.bind(jobController));
jobRouter.get('/',authMiddleware,jobController.getAll.bind(jobController));
jobRouter.get('/client/me',authMiddleware,jobController.getClientJobs.bind(jobController));

jobRouter.get('/interested',authMiddleware,jobController.getInterestedJobs.bind(jobController));
jobRouter.post('/:jobId/interest',authMiddleware,jobController.addJobInterest.bind(jobController));
jobRouter.delete('/:jobId/interest',authMiddleware,jobController.removeJobInterest.bind(jobController));

jobRouter.get('/freelancer/me',authMiddleware,jobController.getFreelancerJobs.bind(jobController));
jobRouter.patch('/:id/status',authMiddleware,jobController.changeStatus.bind(jobController));
jobRouter.post('/:id/activate',authMiddleware,jobController.startJob.bind(jobController));
jobRouter.get('/:id',authMiddleware,jobController.getById.bind(jobController));
jobRouter.put('/:id',authMiddleware,jobController.update.bind(jobController));
jobRouter.delete('/:id',authMiddleware,jobController.delete.bind(jobController));

export default jobRouter;