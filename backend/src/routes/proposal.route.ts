import { Router } from "express";
import { ProposalController } from "controllers/proposal.controller";
import { JobRepository } from "repositories/job.repository";
import { ProposalRepository } from "repositories/proposalInvitation.repository";
import { ProposalService } from "services/proposal.service";
import { authMiddleware } from "middlewares/authMiddleware";

const proposalRouter = Router();

const proposalRepository = new ProposalRepository();
const jobRepository = new JobRepository();
const proposalService = new ProposalService(proposalRepository, jobRepository);
const proposalController = new ProposalController(proposalService);

proposalRouter.post('/',authMiddleware,proposalController.create.bind(proposalController));
proposalRouter.get('/job/:jobId',authMiddleware,proposalController.getProposalsForJob.bind(proposalController));
proposalRouter.get('/:id',authMiddleware,proposalController.getById.bind(proposalController));
proposalRouter.put('/:id',authMiddleware,proposalController.update.bind(proposalController));
proposalRouter.patch('/:id/status',authMiddleware,proposalController.updateStatus.bind(proposalController));

export default proposalRouter;