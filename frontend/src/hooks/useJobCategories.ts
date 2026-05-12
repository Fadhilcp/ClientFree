import { useEffect, useState } from "react";
import { jobService } from "../services/job.service";

export const useJobConfig = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await jobService.getJobCategories();

                setCategories(res.data.categories || []);
                setSubcategories(res.data.subcategories || []);
            } catch (error) {
                console.error("Failed to fetch job config", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return {
        categories,
        subcategories,
        loading,
    };
};