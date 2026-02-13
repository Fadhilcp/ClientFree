import { Router } from "express";
import { ProposalController } from "../controllers/proposal.controller";
import { JobRepository } from "../repositories/job.repository";
import { ProposalRepository } from "../repositories/proposalInvitation.repository";
import { ProposalService } from "../services/proposal.service";
import { authMiddleware } from "../middlewares/authMiddleware";
import { JobAssignmentRepository } from "../repositories/jobAssignment.repository";
import { AddOnRepository } from "../repositories/addOns.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { RevenueRepository } from "../repositories/revenue.repository";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { UserRepository } from "../repositories/user.repository";
import { NotificationRecipientRepository } from "repositories/notificationRecipient.repository";
import { NotificationRepository } from "repositories/notification.repository";
import { NotificationService } from "services/notification.service";
import { authorizeRole } from "middlewares/authorizeRole";
import { UserRole } from "constants/user.constants";

const proposalRouter = Router();

const proposalRepository = new ProposalRepository();
const jobRepository = new JobRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const addOnRepository = new AddOnRepository();
const paymentRepository = new PaymentRepository();
const revenueRepository = new RevenueRepository();
const userRepository = new UserRepository();
// notification
const notificationRepository = new NotificationRepository();
const notificationRecipientRepository = new NotificationRecipientRepository();

const notificationService = new NotificationService(
    notificationRepository,
    notificationRecipientRepository,
    userRepository,
);

const proposalService = new ProposalService(
    proposalRepository, 
    jobRepository, 
    jobAssignmentRepository, 
    addOnRepository, 
    paymentRepository,
    revenueRepository,
    userRepository,
    notificationService   
);
const proposalController = new ProposalController(proposalService);

proposalRouter.use(authMiddleware, verifyUserNotBanned);

proposalRouter.post('/',proposalController.create.bind(proposalController));
proposalRouter.post('/verify-upgrade-payment',proposalController.verifyUpgradePayment.bind(proposalController));
proposalRouter.get('/me',proposalController.getMyProposals.bind(proposalController));
proposalRouter.get('/client',proposalController.getProposalsForClient.bind(proposalController));
proposalRouter.get('/job/:jobId',proposalController.getProposalsForJob.bind(proposalController));

proposalRouter.get('/status/:jobId',authorizeRole(UserRole.FREELANCER),proposalController.getProposalIsSubmitted.bind(proposalController));

proposalRouter.get('/:proposalId',proposalController.getById.bind(proposalController));
proposalRouter.put('/:proposalId',proposalController.update.bind(proposalController));

proposalRouter.patch('/:proposalId/cancel',proposalController.cancelProposal.bind(proposalController));
proposalRouter.patch('/:proposalId/withdraw-invitation',proposalController.withdrawInvitation.bind(proposalController));

proposalRouter.patch('/:proposalId/status',proposalController.updateStatus.bind(proposalController));
proposalRouter.post('/:proposalId/accept',proposalController.acceptProposal.bind(proposalController));

proposalRouter.post('/job/:jobId/invite/:freelancerId',proposalController.inviteFreelancer.bind(proposalController));
proposalRouter.patch('/job/:jobId/invitation/:freelancerId/accept',proposalController.acceptInvitation.bind(proposalController));

proposalRouter.post('/job/:jobId/ai-shortlist',proposalController.aiShortlistProposals.bind(proposalController));

export default proposalRouter;