import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IJobService } from "./interface/IJobService";
import { IJob, IJobDocument } from "types/job.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { IProposalInvitationRepository } from "repositories/interfaces/IProposalInvitation";
import { IProposalInvitation, IProposalInvitationDocument } from "types/proposalInvitation.type";

export class JobService implements IJobService {

    constructor(
        private jobRepository: IJobRepository, 
        private proposalInvitationRepository: IProposalInvitationRepository
    ){}

    async createJob(data: IJob): Promise<IJobDocument> {
        const result = await this.jobRepository.create(data);

        return result;
    }

    async getAllJobs(): Promise<IJobDocument[]> {
        const result = await this.jobRepository.findAll();

        return result;
    }

    async getJobById(jobId: string): Promise<IJobDocument> {
        if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

        const result = await this.jobRepository.findById(jobId);

        if(!result) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');
        return result;
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

    async addProposal(jobId: string, data: IProposalInvitation): Promise<IProposalInvitationDocument> {
        
        const job = await this.jobRepository.findById(jobId);

        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');

        const proposal = await this.proposalInvitationRepository.create({
            ...data,
            jobId
        });

        job.proposals.push(proposal._id);
        job.proposalCount += 1;
        await job.save();

        return proposal;
    }
}