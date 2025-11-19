import { JobController } from "controllers/job.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { JobRepository } from "repositories/job.repository";
import { ProposalInvitationRepository } from "repositories/proposalInvitation.repository";
import { JobService } from "services/job.service";

const jobRouter = Router();

const jobRepository = new JobRepository();
const proposalInvitationRepository = new ProposalInvitationRepository();
const jobSerivce = new JobService(jobRepository, proposalInvitationRepository);
const jobController = new JobController(jobSerivce);

jobRouter.post('/',jobController.createJob.bind(jobController));
jobRouter.get('/',jobController.getAll.bind(jobController));
jobRouter.get('/:id',jobController.getById.bind(jobController));
jobRouter.put('/:id',jobController.update.bind(jobController));
jobRouter.delete('/:id',jobController.delete.bind(jobController));

jobRouter.post('/:id/proposal',authMiddleware,jobController.addProposal.bind(jobController));

export default jobRouter;