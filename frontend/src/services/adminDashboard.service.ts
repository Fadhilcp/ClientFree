import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';

class AdminDashboardService {
    getAdminDashboardStats() {
        return axios.get(endPoints.DASHBOARD.GET_ADMIN_STATS);
    }
}

export const adminDashboardService = new AdminDashboardService();