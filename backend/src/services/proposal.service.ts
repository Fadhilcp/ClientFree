import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { IProposalRepository } from "repositories/interfaces/IProposalInvitation";
import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IProposalInvitation, ProposalStatus } from "types/proposalInvitation.type";
import { IProposalService } from "./interface/IProposalService";
import { mapProposal } from "mappers/proposal.mapper";
import { ProposalDTO } from "dtos/proposal.dto";
import { UpdateQuery } from "mongoose";
import { IJobDocument } from "types/job.type";

export class ProposalService implements IProposalService {
    constructor(private proposalRepository: IProposalRepository, private jobRepository: IJobRepository){};

    async createProposal(jobId: string, freelancerId: string, payload: IProposalInvitation): Promise<ProposalDTO> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, "Job not found");

        const proposal = await this.proposalRepository.create({
            ...payload,
            jobId,
            freelancerId,
            status: "pending"
        });

        // increment proposalCount on job
        await this.jobRepository.findByIdAndUpdate(jobId, {
            $push: { proposals: proposal._id },
            $inc: { proposalCount: 1 }
        } as UpdateQuery<IJobDocument> );

        return mapProposal(proposal);
    }

    async getProposalsForJob(jobId: string): Promise<ProposalDTO[]> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, "Job not found");

        const proposals = await this.proposalRepository.findByJob(jobId);
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
}
