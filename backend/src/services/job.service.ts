import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IJobService } from "./interface/IJobService";
import { IJob, IJobDocument } from "types/job.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { FilterQuery } from "mongoose";
import { JobMapper } from "mappers/job.mapper";
import { JobDetailDTO, JobListDTO } from "dtos/job.dto";

export class JobService implements IJobService {

    constructor(private jobRepository: IJobRepository){}

    async createJob(data: IJob): Promise<IJobDocument> {
        const result = await this.jobRepository.create(data);

        return result;
    }

    async getAllJobs(status?: string): Promise<JobListDTO[]> {
            const jobs = status
        ? await this.jobRepository.findWithSkills({ status })
        : await this.jobRepository.findWithSkills({});

        return jobs.map(job => JobMapper.toListDTO(job));
    }

    async getJobById(jobId: string): Promise<JobDetailDTO> {
        if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

        const result = await this.jobRepository.findByIdWithSkills(jobId);

        if(!result) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');
        return JobMapper.toDetailDTO(result);;
    }

    async updateJob(jobId: string, data: IJob): Promise<IJobDocument> {
       if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');
       
       const updated = await this.jobRepository.findByIdAndUpdate(jobId,data);

       if(!updated) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');

       return updated;
    }

    async deleteJob(jobId: string): Promise<string> {
        if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

        const deleted = await this.jobRepository.deleteOne({ _id: jobId })

        if(deleted.deletedCount === 0) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');

        return 'Job is deleted'
    }

    async getClientJobs(clientId: string, status?: string): Promise<JobListDTO[]> {
        const filter: FilterQuery<IJobDocument> = { clientId };
        
        if(status){
            filter.status = status;
        }

        const jobs = await this.jobRepository.findWithSkills(filter);
        
        return jobs.map(job => JobMapper.toListDTO(job));
    }
}