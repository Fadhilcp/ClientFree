import { Router } from "express";
import { ProposalController } from "controllers/proposal.controller";
import { JobRepository } from "repositories/job.repository";
import { ProposalRepository } from "repositories/proposalInvitation.repository";
import { ProposalService } from "services/proposal.service";
import { authMiddleware } from "middlewares/authMiddleware";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";

const proposalRouter = Router();

const proposalRepository = new ProposalRepository();
const jobRepository = new JobRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const proposalService = new ProposalService(proposalRepository, jobRepository, jobAssignmentRepository);
const proposalController = new ProposalController(proposalService);

proposalRouter.post('/',authMiddleware,proposalController.create.bind(proposalController));
proposalRouter.get('/me',authMiddleware,proposalController.getMyProposals.bind(proposalController));
proposalRouter.get('/client',authMiddleware,proposalController.getProposalsForClient.bind(proposalController));
proposalRouter.get('/job/:jobId',authMiddleware,proposalController.getProposalsForJob.bind(proposalController));
proposalRouter.get('/:proposalId',authMiddleware,proposalController.getById.bind(proposalController));
proposalRouter.put('/:proposalId',authMiddleware,proposalController.update.bind(proposalController));
proposalRouter.patch('/:proposalId/status',authMiddleware,proposalController.updateStatus.bind(proposalController));
proposalRouter.post('/:proposalId/accept',authMiddleware,proposalController.acceptProposal.bind(proposalController));

proposalRouter.post('/job/:jobId/invite/:freelancerId',authMiddleware,proposalController.inviteFreelancer.bind(proposalController));
proposalRouter.post('/job/:jobId/invitation/:freelancerId/accept',authMiddleware,proposalController.acceptInvitation.bind(proposalController));

export default proposalRouter;