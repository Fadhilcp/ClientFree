import { useEffect, useState } from "react";
import { adminDashboardService } from "@/services/adminDashboard.service";
import type { AdminDashboardStats } from "../types/admin/adminDashboard.type";

interface UseAdminDashboardReturn {
    stats: AdminDashboardStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
    const [stats, setStats]     = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);
    const [trigger, setTrigger] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const fetch = async () => {
        setLoading(true);
        setError(null);
            try {
                const response = await adminDashboardService.getAdminDashboardStats();
                const { stats } = response.data;
                
                if (!cancelled) setStats(stats);
            } catch (err: any) {
                if (!cancelled)
                setError(err?.response?.data?.error ?? "Failed to load dashboard stats");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetch();
        return () => { cancelled = true; };
    }, [trigger]);

    const refetch = () => setTrigger((t) => t + 1);

    return { stats, loading, error, refetch };
};