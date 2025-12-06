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
import { createJobSchema } from "schema/job.schema";
import { IUserRepository } from "repositories/interfaces/IUserRepository";

export class JobService implements IJobService {

    constructor(
        private _jobRepository: IJobRepository, 
        private _proposalRepository: IProposalRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _userRepository: IUserRepository,
    ){}

    async createJob(jobData: IJob): Promise<JobDetailDTO> {
        const parsed = createJobSchema.safeParse(jobData);
        if(!parsed.success){
            const errors = parsed.error.format();
            throw createHttpError(HttpStatus.BAD_REQUEST,`Job validation failed: ${JSON.stringify(errors)}`);
        }
        // const jobs = await this.jobRepository.find({ clientId: data.clientId, category: data.category });
        // if(jobs.length > 5){
        //     throw createHttpError(HttpStatus.CONFLICT, "same category has more than 5 jobs");
        // }
        const result = await this._jobRepository.create(jobData);

        return JobMapper.toDetailDTO(result)
    }

    async getAllJobs(freelancerId?: string, status?: string): Promise<JobListDTO[]> {
        let interestedJobIds: string[] = [];

        if(freelancerId) {
            const user = await this._userRepository.findById(freelancerId);
            if(user && user.role === "freelancer") {
                interestedJobIds = user.interests
                ?.filter(i => i.type === "freelancerJob" && i.jobId)
                .map(i => i.jobId!.toString()) ?? [];
            }
        }
        const filter: FilterQuery<IJobDocument> = {};
        if(status) filter.status = status;
        filter.isDeleted = false;

        const jobs = await this._jobRepository.findWithSkills(filter);

        return jobs.map(job => ({
            ...JobMapper.toListDTO(job),
            isInterested: interestedJobIds.includes(job.id)
        }));
    }

    async getJobById(jobId: string, user: AuthPayload): Promise<JobDetailDTO> {
        if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

        const job = await this._jobRepository.findByIdWithDetails(jobId);
        
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');
        // to prevent job detail from other clients
        if(user.role === 'client'){
            if(job.clientId.toString() !== user._id.toString()){
                throw createHttpError(HttpStatus.FORBIDDEN, 'You cannot view jobs posted by other clients.');
            }
        }
        return JobMapper.toDetailDTO(job);
    }

    async updateJob(jobId: string, jobData: IJob): Promise<JobDetailDTO> {
       if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');
       
       const updated = await this._jobRepository.findByIdAndUpdate(jobId,jobData);

       if(!updated) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');

       return JobMapper.toDetailDTO(updated);
    }

    async deleteJob(jobId: string): Promise<string> {
        if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

        const result = await this._jobRepository.updateOne({ _id: jobId }, { isDeleted: true });

        if(!result) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);

        return 'Job is deleted'
    }

    async getClientJobs(clientId: string, status?: string): Promise<JobListDTO[]> {
        const filter: FilterQuery<IJobDocument> = { clientId, isDeleted: false };
        
        if(status){
            filter.status = status;
        }
        const jobs = await this._jobRepository.findWithSkills(filter);
        
        return jobs.map(job => JobMapper.toListDTO(job));
    }
    
    async changeStatus(jobId: string, clientId: string, status: IJobStatus): Promise<void> {
        const allowed = ["open","active","completed","cancelled"];

        if(!allowed.includes(status)){
            throw createHttpError(HttpStatus.BAD_REQUEST,HttpResponse.INVALID_STATUS);
        }
        const job = await this._jobRepository.findById(jobId);
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        
        if(job.clientId.toString() !== clientId){
            throw createHttpError(HttpStatus.FORBIDDEN, "Not allowed");
        }
        await this._jobRepository.findByIdAndUpdate(jobId, { status });
    }

    async startJob(jobId: string, clientId: string): Promise<JobDetailDTO> {
        const job = await this._jobRepository.findById(jobId);

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
        await this._proposalRepository.updateMany(
            {
                jobId: job._id,
                _id: { $nin: job.acceptedProposalIds }
            },
            { $set: { status: 'rejected'}}
        );
        const proposals = await this._proposalRepository.find({
            _id: { $in: job.acceptedProposalIds }
        });

        if(!proposals || proposals.length === 0){
            throw createHttpError(HttpStatus.NOT_FOUND, "Accepted proposals not found");
        }
        
        const totalAmount = proposals.reduce(
            (acc,proposal) => acc + (proposal.bidAmount || 0),
            0
        );
        await this._jobAssignmentRepository.updateMany(
            { proposalId: { $in: job.acceptedProposalIds }},
            { status: "active" }
        );
        
        const updatedJob = await this._jobRepository.findByIdAndUpdate(jobId, {
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

        const assignments = await this._jobAssignmentRepository.findWithJobDetail(filter);
        if(!assignments) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        const jobs = assignments.map(a => a.jobId as IJobDocument);

        return jobs.map(job => JobMapper.toListDTO(job));
    }

    async getInterestedJobsForFreelancer(freelancerId: string): Promise<JobListDTO[]> {
        const user = await this._userRepository.findById(freelancerId);
        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        const interestedJobIds = user.interests
        ?.filter(i => i.type === "freelancerJob" && i.jobId)
        .map(i => i.jobId?.toString());

        if(!interestedJobIds?.length) return [];

        const jobs = await this._jobRepository.findWithSkills({ _id: { $in: interestedJobIds }, isDeleted: false });

        return jobs.map(job => ({
            ...JobMapper.toListDTO(job),
            isInterested: interestedJobIds.includes(job.id)
        }));
    }

    async addJobInterest(freelancerId: string, jobId: string): Promise<void> {
        await this._userRepository.updateOne(
            { _id: freelancerId },
            {
                $addToSet: {
                    interests: {
                        type: "freelancerJob",
                        jobId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }
        );
    }

    async removeJobInterest(freelancerId: string, jobId: string): Promise<void> {
        await this._userRepository.updateOne(
            { _id: freelancerId },
            {
                $pull: {
                    interests: {
                        type: "freelancerJob",
                        jobId
                    }
                }
            }
        );
    }
}