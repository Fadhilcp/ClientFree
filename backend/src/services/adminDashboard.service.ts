import { AdminDashboardStatsDTO } from "../dtos/adminDashboard.dto";
import { IAdminDashboardService } from "./interface/IAdminDashboardService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IJobRepository } from "../repositories/interfaces/IJobRepository";
import { IPaymentRepository } from "../repositories/interfaces/IPaymentRepository";
import { IRevenueRepository } from "../repositories/interfaces/IRevenueRepository";
import adminDashboardMapper from "../mappers/adminDashboard.mapper";

export class AdminDashboardService implements IAdminDashboardService {

    constructor(
        private _userRepository: IUserRepository,
        private _jobRepository: IJobRepository,
        private _paymentRepository: IPaymentRepository,
        private _revenueRepository: IRevenueRepository,
    ) {}

    async getDashboardStats(): Promise<AdminDashboardStatsDTO> {

        const [
            totalClients,
            totalFreelancers,
            newUsersThisMonth,
            totalActive,
            totalOpen,
            totalCompleted,
            totalCancelled,
            totalRevenue,
            revenueSummary,
            revenueThisMonth,
            revenueGraph,
            userGrowthGraph,
            rawRecentPayments,
            rawRecentUsers,
        ] = await Promise.all([
            this._userRepository.countByRole("client"),
            this._userRepository.countByRole("freelancer"),
            this._userRepository.countNewThisMonth(),
            this._jobRepository.countByStatus("active"),
            this._jobRepository.countByStatus("open"),
            this._jobRepository.countByStatus("completed"),
            this._jobRepository.countByStatus("cancelled"),
            this._revenueRepository.getTotalRevenue(),
            this._revenueRepository.getRevenueSummaryByType(),
            this._revenueRepository.getRevenueThisMonth(),
            this._revenueRepository.getRevenueGraph(6),
            this._userRepository.getUserGrowthGraph(6),
            this._paymentRepository.getRecentPayments(10),
            this._userRepository.getRecentUsers(8),
        ]);

        return {
            users: {
                totalClients,
                totalFreelancers,
                totalUsers: totalClients + totalFreelancers,
                newUsersThisMonth,
            },
            jobs: {
                totalActive: totalActive + totalOpen,
                totalCompleted,
                totalCancelled,
                totalJobs: totalActive + totalOpen + totalCompleted + totalCancelled,
            },
            revenue: {
                totalRevenue,
                revenueThisMonth,
                totalCommission: revenueSummary.commission,
                totalSubscription: revenueSummary.subscription,
                totalAddOn: revenueSummary.addOn,
            },
            revenueGraph,
            userGrowthGraph,
            recentPayments: adminDashboardMapper.toRecentPaymentList(rawRecentPayments),
            recentUsers: adminDashboardMapper.toRecentUserList(rawRecentUsers),
        };
    }
}