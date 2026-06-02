export interface AdminDashboardStats {
    users: {
        totalClients: number;
        totalFreelancers: number;
        totalUsers: number;
        newUsersThisMonth: number;
    };
    jobs: {
        totalActive: number;
        totalCompleted: number;
        totalCancelled: number;
        totalJobs: number;
    };
    revenue: {
        totalRevenue: number;
        commission: number;
        subscription: number;
        addOn: number;
        revenueThisMonth: number;
    };
    revenueGraph: RevenueGraphPoint[];
    userGrowthGraph: UserGrowthGraphPoint[];
    recentPayments: RecentPayment[];
    recentUsers: RecentUser[];
}

export interface RevenueGraphPoint {
    month: number;
    year: number;
    commission: number;
    subscription: number;
    addOn: number;
    total: number;
}

export interface UserGrowthGraphPoint {
    month: number;
    year: number;
    clients: number;
    freelancers: number;
    total: number;
}

export interface RecentPayment {
    _id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    clientId: string | null;
    clientName: string | null;
    freelancerId: string | null;
    freelancerName: string | null;
    createdAt: string;
}

export interface RecentUser {
    _id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    isVerified: boolean;
    createdAt: string;
}