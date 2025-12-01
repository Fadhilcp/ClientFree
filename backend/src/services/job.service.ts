import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IJobService } from "./interface/IJobService";
import { IJob, IJobDocument, IJobStatus } from "types/job.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { FilterQuery } from "mongoose";
import { JobMapper } from "mappers/job.mapper";
import { JobDetailDTO, JobListDTO } from "dtos/job.dto";
import { HttpResponse } from "constants/responseMessage.constant";
import { IProposalRepository } from "repositories/interfaces/IProposalInvitation";
import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { IJobAssignmentDocument } from "types/jobAssignment.type";
import { AuthPayload } from "types/auth.type";

export class JobService implements IJobService {

    constructor(
        private jobRepository: IJobRepository, 
        private proposalRepository: IProposalRepository,
        private jobAssignmentRepository: IJobAssignmentRepository
    ){}

    async createJob(data: IJob): Promise<IJobDocument> {
        console.log("🚀 ~ JobService ~ createJob ~ data:", data)
        const result = await this.jobRepository.create(data);

        return result;
    }

    async getAllJobs(status?: string): Promise<JobListDTO[]> {
            const jobs = status
        ? await this.jobRepository.findWithSkills({ status })
        : await this.jobRepository.findWithSkills({});

        return jobs.map(job => JobMapper.toListDTO(job));
    }

    async getJobById(jobId: string, user: AuthPayload): Promise<JobDetailDTO> {
        if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

        const job = await this.jobRepository.findByIdWithDetails(jobId);
        
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');
        // to prevent job detail from other clients
        if(user.role === 'client'){
            if(job.clientId.toString() !== user._id.toString()){
                throw createHttpError(HttpStatus.FORBIDDEN, 'You cannot view jobs posted by other clients.');
            }
        }
        return JobMapper.toDetailDTO(job);
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

        if(deleted.deletedCount === 0) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);

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

    
    async changeStatus(jobId: string, clientId: string, status: IJobStatus): Promise<void> {
        const allowed = ["open","active","completed","cancelled"];

        if(!allowed.includes(status)){
            throw createHttpError(HttpStatus.BAD_REQUEST,HttpResponse.INVALID_STATUS);
        }
        const job = await this.jobRepository.findById(jobId);
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        
        if(job.clientId.toString() !== clientId){
            throw createHttpError(HttpStatus.FORBIDDEN, "Not allowed");
        }
        await this.jobRepository.findByIdAndUpdate(jobId, { status });
    }

    async startJob(jobId: string, clientId: string): Promise<JobDetailDTO> {
        const job = await this.jobRepository.findById(jobId);

        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        if(job.clientId.toString() !== clientId) {
            throw createHttpError(HttpStatus.FORBIDDEN, "Not allowed");
        }
        if(job.status !== "open"){
            throw createHttpError(HttpStatus.CONFLICT, "Job must be in open state to activate");
        }
        if(job.acceptedProposalIds.length === 0){
            throw createHttpError(HttpStatus.CONFLICT,"No accepted proposal exists for this job");
        }
        // to reject all other proposals
        await this.proposalRepository.updateMany(
            {
                jobId: job._id,
                _id: { $nin: job.acceptedProposalIds }
            },
            { $set: { status: 'rejected'}}
        );
        const proposals = await this.proposalRepository.find({
            _id: { $in: job.acceptedProposalIds }
        });

        if(!proposals || proposals.length === 0){
            throw createHttpError(HttpStatus.NOT_FOUND, "Accepted proposals not found");
        }
        
        const totalAmount = proposals.reduce(
            (acc,proposal) => acc + (proposal.bidAmount || 0),
            0
        );
        await this.jobAssignmentRepository.updateMany(
            { proposalId: { $in: job.acceptedProposalIds }},
            { status: "active" }
        );
        
        const updatedJob = await this.jobRepository.findByIdAndUpdate(jobId, {
            $set: {
                status: "active",
                "payment.budget": totalAmount
            }
        } as FilterQuery<IJobDocument> );

        if(!updatedJob) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        
        return JobMapper.toDetailDTO(updatedJob);
    }

    async getFreelancerJobs(freelancerId: string, status?: string): Promise<any[]> {
        const filter: FilterQuery<IJobAssignmentDocument> = { freelancerId };
        if(status){
            filter.status = status
        }

        const assignments = await this.jobAssignmentRepository.findWithJobDetail(filter);
        if(!assignments) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        const jobs = assignments.map(a => a.jobId as IJobDocument);

        return jobs.map(job => JobMapper.toListDTO(job));
    }
}