import { JobFilters, JobSort } from "types/filter.type";
import { FreelancerListItemDto } from "../../dtos/freelancerProfile.dto";
import { JobListDTO } from "../../dtos/job.dto";

export interface IMatchService {
    getBestMatchJobs(
        freelancerId: string,
        limit: number,
        cursor?: string,
        search?: string,
        filters?: JobFilters,
        sort?: JobSort
    ): Promise<{ jobs: JobListDTO[], nextCursor: string | null }>;
    getBestMatchFreelancers(
        jobId: string,
        limit: number,
        cursor?: string,
        search?: string,
        filters?: {
            location?: string;
            experience?: string;
            hourlyRateMin?: number;
            hourlyRateMax?: number;
            ratingMin?: number;
        }
    ): Promise<{ freelancers: FreelancerListItemDto[], nextCursor: string | null }>;
}