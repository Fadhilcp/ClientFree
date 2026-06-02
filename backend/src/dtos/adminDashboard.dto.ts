export interface AdminDashboardStatsDTO {
    users: {
        totalClients: number;
        totalFreelancers: number;
        totalUsers: number;
        newUsersThisMonth: number;
    };
    jobs: {
        totalActive: number;
        totalCompleted: number;
        totalJobs: number;
        totalCancelled: number;
    };
    revenue: {
        totalRevenue: number;
        totalCommission: number;
        totalSubscription: number;
        totalAddOn: number;
        revenueThisMonth: number;
    };
    revenueGraph: RevenueGraphPointDTO[];
    userGrowthGraph: UserGrowthGraphPointDTO[];
    recentPayments: RecentPaymentDTO[];
    recentUsers: RecentUserDTO[];
}

export interface RevenueGraphPointDTO {
    month: number;
    year: number;
    commission: number;
    subscription: number;
    addOn: number;
    total: number;
}

export interface UserGrowthGraphPointDTO {
    month: number;
    year: number;
    clients: number;
    freelancers: number;
    total: number;
}

export interface RecentPaymentDTO {
    _id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    clientId: string | null;
    clientName: string | null;
    freelancerId: string | null;
    freelancerName: string | null;
    createdAt: Date;
}

export interface RecentUserDTO {
    _id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    isVerified: boolean;
    createdAt: Date;
}