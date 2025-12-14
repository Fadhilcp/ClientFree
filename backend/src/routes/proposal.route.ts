import { Router } from "express";
import { ProposalController } from "controllers/proposal.controller";
import { JobRepository } from "repositories/job.repository";
import { ProposalRepository } from "repositories/proposalInvitation.repository";
import { ProposalService } from "services/proposal.service";
import { authMiddleware } from "middlewares/authMiddleware";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { AddOnRepository } from "repositories/addOns.repository";
import { PaymentRepository } from "repositories/payment.repository";
import { RevenueRepository } from "repositories/revenue.repository";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { UserRepository } from "repositories/user.repository";

const proposalRouter = Router();

const proposalRepository = new ProposalRepository();
const jobRepository = new JobRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const addOnRepository = new AddOnRepository();
const paymentRepository = new PaymentRepository();
const revenueRepository = new RevenueRepository();
const userRepository = new UserRepository();

const proposalService = new ProposalService(
    proposalRepository, 
    jobRepository, 
    jobAssignmentRepository, 
    addOnRepository, 
    paymentRepository,
    revenueRepository,
    userRepository,     
);
const proposalController = new ProposalController(proposalService);

proposalRouter.use(authMiddleware, verifyUserNotBanned);

proposalRouter.post('/',proposalController.create.bind(proposalController));
proposalRouter.post('/verify-upgrade-payment',proposalController.verifyUpgradePayment.bind(proposalController));
proposalRouter.get('/me',proposalController.getMyProposals.bind(proposalController));
proposalRouter.get('/client',proposalController.getProposalsForClient.bind(proposalController));
proposalRouter.get('/job/:jobId',proposalController.getProposalsForJob.bind(proposalController));
proposalRouter.get('/:proposalId',proposalController.getById.bind(proposalController));
proposalRouter.put('/:proposalId',proposalController.update.bind(proposalController));
proposalRouter.patch('/:proposalId/status',proposalController.updateStatus.bind(proposalController));
proposalRouter.post('/:proposalId/accept',proposalController.acceptProposal.bind(proposalController));

proposalRouter.post('/job/:jobId/invite/:freelancerId',proposalController.inviteFreelancer.bind(proposalController));
proposalRouter.post('/job/:jobId/invitation/:freelancerId/accept',proposalController.acceptInvitation.bind(proposalController));

export default proposalRouter;