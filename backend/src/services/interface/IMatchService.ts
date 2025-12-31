import { FreelancerListItemDto } from "dtos/freelancerProfile.dto";
import { JobListDTO } from "dtos/job.dto";

export interface IMatchService {
    getBestMatchJobs(freelancerId: string): Promise<JobListDTO[] | null>;
    getBestMatchFreelancers(jobId: string): Promise<FreelancerListItemDto[]>;
}