import { JobController } from "controllers/job.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
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
jobRouter.put('/:id',jobController.update.bind(jobController));
jobRouter.delete('/:id',jobController.delete.bind(jobController));

export default jobRouter;