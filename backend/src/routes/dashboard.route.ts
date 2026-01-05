import { DashBoardController } from "../controllers/dashboard.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { JobAssignmentRepository } from "../repositories/jobAssignment.repository";
import { WalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionRepository } from "../repositories/walletTransaction.repository";
import { ClientDashboardService } from "../services/clientDashboard.service";
import { FreelancerDashboardService } from "../services/freelancerDashboard.service";

const dashboardRouter = Router();

const walletTransactionRepository = new WalletTransactionRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const walletRepository = new WalletRepository();

const clientDashboardService = new ClientDashboardService(
    walletTransactionRepository,
    jobAssignmentRepository,
    walletRepository,
)

const freelancerDashboardService = new FreelancerDashboardService(
    walletTransactionRepository,
    jobAssignmentRepository,
    walletRepository,
)

const dashboardController = new DashBoardController(clientDashboardService,freelancerDashboardService);

dashboardRouter.use(authMiddleware, verifyUserNotBanned);

dashboardRouter.get('/payments-overview',dashboardController.getClientPaymentOverview.bind(dashboardController));

export default dashboardRouter;