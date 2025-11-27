import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { IProposalRepository } from "repositories/interfaces/IProposalInvitation";
import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IProposalInvitation, IProposalInvitationDocument, ProposalStatus } from "types/proposalInvitation.type";
import { IProposalService } from "./interface/IProposalService";
import { mapProposal } from "mappers/proposal.mapper";
import { ProposalDTO } from "dtos/proposal.dto";
import { FilterQuery, UpdateQuery } from "mongoose";
import { IJobDocument } from "types/job.type";
import { HttpResponse } from "constants/responseMessage.constant";
import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";

export class ProposalService implements IProposalService {
    constructor(
        private proposalRepository: IProposalRepository, 
        private jobRepository: IJobRepository,
        private jobAssignmentRepository: IJobAssignmentRepository
    ){};

    async createProposal(jobId: string, freelancerId: string, payload: IProposalInvitation): Promise<ProposalDTO> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, "Job not found");

        const exists = await this.proposalRepository.findOne({ jobId, freelancerId });
        if (exists) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal already submitted");
        }

        const { bidAmount, duration, description, milestones, optionalUpgrades } = payload;
        const proposal = await this.proposalRepository.create({
            bidAmount,
            duration,
            description,
            milestones,
            optionalUpgrades,
            jobId,
            freelancerId,
            status: "pending",
            isInvitation: false
        });

        // increment proposalCount on job
        await this.jobRepository.findByIdAndUpdate(jobId, {
            $push: { proposals: proposal._id },
            $inc: { proposalCount: 1 }
        } as UpdateQuery<IJobDocument> );

        return mapProposal(proposal);
    }

    async getProposalsForJob(jobId: string, status?: string, isInvitation?: boolean): Promise<ProposalDTO[]> {

        const job = await this.jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, "Job not found");

        const filter: FilterQuery<IProposalInvitationDocument> = { jobId }; 

        if (status) filter.status = status;
        if (isInvitation !== undefined) filter.isInvitation = isInvitation === true;

        const proposals = await this.proposalRepository.findByJob(filter);
        return proposals.map(mapProposal);
    }

    async getById(id: string): Promise<ProposalDTO> {
        const proposal = await this.proposalRepository.findById(id);
        if (!proposal) throw createHttpError(HttpStatus.NOT_FOUND, "Proposal not found");
        return mapProposal(proposal);
    }

    async updateProposal(id: string, data: IProposalInvitation): Promise<ProposalDTO> {
        const proposal = await this.proposalRepository.findByIdAndUpdate(id, data);
        if (!proposal) throw createHttpError(HttpStatus.NOT_FOUND, "Proposal not found");
        return mapProposal(proposal);
    }

    async updateStatus(id: string, status: ProposalStatus): Promise<ProposalDTO> {
        const allowed = ["pending", "shortlisted", "accepted", "rejected", "invited"];

        if (!allowed.includes(status)) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid proposal status");
        }

        const proposal = await this.proposalRepository.findByIdAndUpdate(id, { status });
        if (!proposal) throw createHttpError(HttpStatus.NOT_FOUND, "Proposal not found");

        return mapProposal(proposal);
    }

    async acceptProposal(id: string): Promise<void> {
        
        const proposal = await this.proposalRepository.findByIdAndUpdate(id,{ status: 'accepted'});
        if(!proposal){
            throw createHttpError(HttpStatus.NOT_FOUND,HttpResponse.PROPOSAL_NOT_FOUND);
        }

        const job = await this.jobRepository.findById(proposal.jobId.toString());

        if(!job){
            throw createHttpError(HttpStatus.NOT_FOUND,HttpResponse.JOB_NOT_FOUND);
        }

        if(job.acceptedProposalIds.length > 0){
            throw createHttpError(HttpStatus.CONFLICT, "Job already has an accepted proposal");
        }
        
        await this.jobAssignmentRepository.create({
            jobId: job._id,
            freelancerId: proposal.freelancerId,
            proposalId: proposal._id,
            amount: proposal.bidAmount || 0,
            tasks: [],
            status: "pending"
        });

        await this.jobRepository.findByIdAndUpdate(
            job._id.toString(),
            { $push: { acceptedProposalIds: proposal._id } } as FilterQuery<IJobDocument>
        );
    }
}
