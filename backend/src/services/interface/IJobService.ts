import { JobDetailDTO, JobListDTO } from "dtos/job.dto";
import { IJob, IJobDocument } from "types/job.type";

export interface IJobService {
    createJob(data: IJob): Promise<IJobDocument>;
    getAllJobs(status?: string): Promise<JobListDTO[]>;
    getJobById(jobId: string): Promise<JobDetailDTO>;
    updateJob(jobId: string, data: IJob): Promise<IJobDocument>;
    deleteJob(jobId: string): Promise<string>;
    getClientJobs(clientId: string, status?: string): Promise<JobListDTO[]>;
    changeStatus(jobId: string, clientId: string, status: string): Promise<void>;
    startJob(jobId: string, clientId: string): Promise<void>;
}