import { JobDetailDTO, JobListDTO } from "dtos/job.dto";
import { AuthPayload } from "types/auth.type";
import { IJob, IJobDocument } from "types/job.type";

export interface IJobService {
    createJob(data: IJob): Promise<JobDetailDTO>;
    getAllJobs(status?: string): Promise<JobListDTO[]>;
    getJobById(jobId: string, user: AuthPayload): Promise<JobDetailDTO>;
    updateJob(jobId: string, data: IJob): Promise<IJobDocument>;
    deleteJob(jobId: string): Promise<string>;
    getClientJobs(clientId: string, status?: string): Promise<JobListDTO[]>;
    changeStatus(jobId: string, clientId: string, status: string): Promise<void>;
    startJob(jobId: string, clientId: string): Promise<JobDetailDTO>;
    getFreelancerJobs(freelancerId: string, status?: string): Promise<JobListDTO[]>;
}