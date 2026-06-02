import { DashBoardController } from "../controllers/dashboard.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { JobAssignmentRepository } from "../repositories/jobAssignment.repository";
import { WalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionRepository } from "../repositories/walletTransaction.repository";
import { ClientDashboardService } from "../services/clientDashboard.service";
import { FreelancerDashboardService } from "../services/freelancerDashboard.service";
import { AdminDashboardService } from "../services/adminDashboard.service";
import { UserRepository } from "../repositories/user.repository";
import { JobRepository } from "../repositories/job.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { RevenueRepository } from "../repositories/revenue.repository";
import { authorizeRole } from "../middlewares/authorizeRole";
import { UserRole } from "../constants/user.constants";

const dashboardRouter = Router();

const walletTransactionRepository = new WalletTransactionRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const walletRepository = new WalletRepository();

const userRepository = new UserRepository()
const jobRepository = new JobRepository()
const paymentRepository = new PaymentRepository()
const revenueRepository = new RevenueRepository()

const adminDashboardService = new AdminDashboardService(
    userRepository, jobRepository, paymentRepository, revenueRepository
);


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

const dashboardController = new DashBoardController(
    clientDashboardService, freelancerDashboardService, adminDashboardService
);

dashboardRouter.use(authMiddleware, verifyUserNotBanned);

dashboardRouter.get('/payments-overview',dashboardController.getClientPaymentOverview.bind(dashboardController));

dashboardRouter.get("/admin/stats",authorizeRole(UserRole.ADMIN),dashboardController.getAdminDashboardStats.bind(dashboardController));

export default dashboardRouter;