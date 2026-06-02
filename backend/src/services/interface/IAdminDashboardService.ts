import { AdminDashboardStatsDTO } from "../../dtos/adminDashboard.dto";

export interface IAdminDashboardService {
    getDashboardStats(): Promise<AdminDashboardStatsDTO>
}