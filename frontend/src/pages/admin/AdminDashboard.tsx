import React from "react";
import {
    Users,
    Briefcase,
    TrendingUp,
    UserCheck,
    UserPlus,
    IndianRupee,
} from "lucide-react";

import StatisticCard from "@/components/ui/Card/StatisticCard";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import UserGrowthChart from "@/components/admin/dashboard/UserGrowthChart";
import RecentPaymentsTable from "@/components/admin/dashboard/RecentPaymentsTable";
import RecentUsersTable from "@/components/admin/dashboard/RecentUsersTable";
import {
    ChartSkeleton,
    TableSkeleton,
} from "../../components/admin/dashboard/DashboardSkeletons";

import { useAdminDashboard } from "../../hooks/useAdminDashboard";


const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);


const buildAllCards = (
    users: NonNullable<ReturnType<typeof useAdminDashboard>["stats"]>["users"],
    jobs:  NonNullable<ReturnType<typeof useAdminDashboard>["stats"]>["jobs"],
    revenue: NonNullable<ReturnType<typeof useAdminDashboard>["stats"]>["revenue"],
) => [
    // row 1 — users + jobs
    { title: "Total Users",    value: users.totalUsers,                    icon: <Users size={20} />,       color: "indigo"  },
    { title: "Clients",        value: users.totalClients,                  icon: <UserCheck size={20} />,   color: "blue"    },
    { title: "Freelancers",    value: users.totalFreelancers,              icon: <Briefcase size={20} />,   color: "emerald" },
    { title: "New This Month", value: users.newUsersThisMonth,             icon: <UserPlus size={20} />,    color: "violet"  },
    // row 2 — jobs + revenue
    { title: "Total Jobs",     value: jobs.totalJobs,                      icon: <Briefcase size={20} />,   color: "indigo"  },
    { title: "Active Jobs",    value: jobs.totalActive,                    icon: <TrendingUp size={20} />,  color: "blue"    },
    { title: "Total Revenue",  value: formatCurrency(revenue.totalRevenue),icon: <IndianRupee size={20} />, color: "emerald" },
    { title: "This Month",     value: formatCurrency(revenue.revenueThisMonth), icon: <TrendingUp size={20} />, color: "violet" },
];


const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
            {title}
        </h2>
        {children}
    </section>
);


const AdminDashboard: React.FC = () => {
    const { stats, loading, error, refetch } = useAdminDashboard();

    if (error) {
        return (
            <div className="p-6 bg-white dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center gap-3">
                <p className="text-red-500 font-medium">{error}</p>
                <button
                    onClick={refetch}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-900 min-h-screen space-y-8">

            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Platform overview at a glance
                    </p>
                </div>
                <button
                    onClick={refetch}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 
                               border border-indigo-300 dark:border-indigo-700 rounded 
                               hover:bg-indigo-50 dark:hover:bg-indigo-950 disabled:opacity-50 transition"
                >
                    {loading ? "Refreshing…" : "Refresh"}
                </button>
            </div>

            {/* all stat cards — 2 rows of 4 */}
            {loading || !stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-24" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {buildAllCards(stats.users, stats.jobs, stats.revenue).map((card) => (
                        <StatisticCard
                            key={card.title}
                            title={card.title}
                            value={card.value}
                            icon={card.icon}
                            color={card.color}
                        />
                    ))}
                </div>
            )}

            {/* charts */}
            <Section title="Analytics">
                {loading || !stats ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RevenueChart    data={stats.revenueGraph}    />
                        <UserGrowthChart data={stats.userGrowthGraph} />
                    </div>
                )}
            </Section>

            {/* tables */}
            <Section title="Recent Activity">
                {loading || !stats ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TableSkeleton />
                        <TableSkeleton />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RecentPaymentsTable payments={stats.recentPayments} />
                        <RecentUsersTable    users={stats.recentUsers}       />
                    </div>
                )}
            </Section>

        </div>
    );
};

export default AdminDashboard;