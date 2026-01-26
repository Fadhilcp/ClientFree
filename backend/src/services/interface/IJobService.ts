import { JobDetailDTO, JobListDTO } from "../../dtos/job.dto";
import { AuthPayload } from "../../types/auth.type";
import { IJob } from "../../types/job.type";

export interface IJobService {
    createJob(jobData: IJob): Promise<JobDetailDTO>;
    getAllJobs(
        freelancerId: string, status: string, search: string, limit: number, cursor?: string,
        filters?: {
            category?: string;
            budgetMin?: number;
            budgetMax?: number;
            location?: string;
        }
    ): Promise<{ jobs: JobListDTO[], nextCursor: string | null }>;
    
    getJobById(jobId: string, user: AuthPayload): Promise<JobDetailDTO>;
    updateJob(jobId: string, jobData: IJob): Promise<JobDetailDTO>;
    deleteJob(jobId: string): Promise<string>;

    getClientJobs(
        freelancerId: string, status: string, search: string, limit: number, cursor?: string,
        filters?: {
            category?: string;
            budgetMin?: number;
            budgetMax?: number;
            location?: string;
        }
    ): Promise<{ jobs: JobDetailDTO[], nextCursor: string | null }>;

    changeStatus(jobId: string, clientId: string, status: string): Promise<void>;
    startJob(jobId: string, clientId: string): Promise<JobDetailDTO>;

    getFreelancerJobs(
        freelancerId: string, status: string, search: string, limit: number, cursor?: string,
        filters?: {
            category?: string;
            budgetMin?: number;
            budgetMax?: number;
            location?: string;
        }
    ): Promise<{ jobs: JobListDTO[], nextCursor: string | null }>;
    
    getInterestedJobsForFreelancer(
        freelancerId: string, search: string, limit: number, cursor?: string,
        filters?: {
            category?: string;
            budgetMin?: number;
            budgetMax?: number;
            location?: string;
        }
    ): Promise<{ jobs: JobListDTO[], nextCursor: string | null }>;

    addJobInterest(freelancerId: string, jobId: string): Promise<void>;
    removeJobInterest(freelancerId: string, jobId: string): Promise<void>;
    cancelJob(jobId: string, user: AuthPayload): Promise<string>;
}