import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { IProposalRepository } from "repositories/interfaces/IProposalInvitation";
import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IInvitationDetails, IProposalInvitation, IProposalInvitationDocument, ProposalStatus } from "types/proposalInvitation.type";
import { IProposalService } from "./interface/IProposalService";
import { mapProposal } from "mappers/proposal.mapper";
import { ProposalDTO } from "dtos/proposal.dto";
import { FilterQuery, UpdateQuery } from "mongoose";
import { IJobDocument } from "types/job.type";
import { HttpResponse } from "constants/responseMessage.constant";
import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";

export class ProposalService implements IProposalService {
    constructor(
        private _proposalRepository: IProposalRepository, 
        private _jobRepository: IJobRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository
    ){};

    async createProposal(jobId: string, freelancerId: string, payload: IProposalInvitation): Promise<ProposalDTO> {
        const job = await this._jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, "Job not found");
        const { bidAmount, duration, description, milestones, optionalUpgrades } = payload;

        const invitation = await this._proposalRepository.findOne({
            jobId,
            freelancerId,
            isInvitation: true
        });

        if (invitation) {
            invitation.isInvitation = false;
            invitation.status = "pending";
            invitation.bidAmount = bidAmount;
            invitation.duration = duration;
            invitation.description = description;
            invitation.milestones = milestones;
            invitation.optionalUpgrades = optionalUpgrades;

            const updated = await invitation.save();
            // add to job proposals
            await this._jobRepository.findByIdAndUpdate(jobId, {
                $push: { proposals: updated._id },
                $inc: { proposalCount: 1 }
            } as UpdateQuery<IJobDocument>);

            return mapProposal(updated);
        }

        const exists = await this._proposalRepository.findOne({ jobId, freelancerId });
        if (exists) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal already submitted");
        }

        const proposal = await this._proposalRepository.create({
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
        await this._jobRepository.findByIdAndUpdate(jobId, {
            $push: { proposals: proposal._id },
            $inc: { proposalCount: 1 }
        } as UpdateQuery<IJobDocument> );

        return mapProposal(proposal);
    }

    async getProposalsForJob(jobId: string, status?: string, isInvitation?: boolean): Promise<ProposalDTO[]> {

        const job = await this._jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, "Job not found");

        const filter: FilterQuery<IProposalInvitationDocument> = { jobId }; 

        if (status) filter.status = status;
        if (isInvitation !== undefined) filter.isInvitation = isInvitation === true;

        const proposals = await this._proposalRepository.findByJob(filter);
        return proposals.map(mapProposal);
    }

    async getById(proposalId: string): Promise<ProposalDTO> {
        const proposal = await this._proposalRepository.findById(proposalId);
        if (!proposal) throw createHttpError(HttpStatus.NOT_FOUND, "Proposal not found");
        return mapProposal(proposal);
    }

    async updateProposal(proposalId: string, proposalData: IProposalInvitation): Promise<ProposalDTO> {
        const proposal = await this._proposalRepository.findByIdAndUpdate(proposalId, proposalData);
        if (!proposal) throw createHttpError(HttpStatus.NOT_FOUND, "Proposal not found");
        return mapProposal(proposal);
    }

    async updateStatus(proposalId: string, status: ProposalStatus): Promise<ProposalDTO> {
        const allowed = ["pending", "shortlisted", "accepted", "rejected", "invited"];

        if (!allowed.includes(status)) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid proposal status");
        }

        const proposal = await this._proposalRepository.findByIdAndUpdate(proposalId, { status });
        if (!proposal) throw createHttpError(HttpStatus.NOT_FOUND, "Proposal not found");

        return mapProposal(proposal);
    }

    async acceptProposal(proposalId: string): Promise<void> {
        
        const proposal = await this._proposalRepository.findByIdAndUpdate(proposalId,{ status: 'accepted'});
        if(!proposal){
            throw createHttpError(HttpStatus.NOT_FOUND,HttpResponse.PROPOSAL_NOT_FOUND);
        }

        const job = await this._jobRepository.findById(proposal.jobId.toString());

        if(!job){
            throw createHttpError(HttpStatus.NOT_FOUND,HttpResponse.JOB_NOT_FOUND);
        }

        if(job.acceptedProposalIds.length > 0){
            throw createHttpError(HttpStatus.CONFLICT, "Job already has an accepted proposal");
        }
        
        await this._jobAssignmentRepository.create({
            jobId: job._id,
            freelancerId: proposal.freelancerId,
            proposalId: proposal._id,
            amount: proposal.bidAmount || 0,
            tasks: [],
            status: "pending"
        });

        await this._jobRepository.findByIdAndUpdate(
            job._id.toString(),
            { $push: { acceptedProposalIds: proposal._id } } as FilterQuery<IJobDocument>
        );
    }

        async inviteFreelancer(
            jobId: string, clientId: string, freelancerId: string, invitationData: IInvitationDetails
        ): Promise<ProposalDTO> {
        const job = await this._jobRepository.findById(jobId);
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        if(job.clientId.toString() !== clientId){
            throw createHttpError(HttpStatus.FORBIDDEN, "You cannot invite freelancers to this job");
        }
        const existing = await this._proposalRepository.findOne({ jobId, freelancerId });
        if(existing){
            // avoid duplicate
            if(existing.isInvitation && existing.status === "invited"){
                throw createHttpError(HttpStatus.CONFLICT, "Freelancer is already invited");
            }
            if(!existing.isInvitation){
                throw createHttpError(HttpStatus.CONFLICT, "Freelancer already submitted a proposal");
            }
        }

        const invitation = await this._proposalRepository.create({
            freelancerId,
            jobId,
            isInvitation: true,
            invitedBy: clientId,
            invitation: invitationData,
            status: "invited",
        });

        return mapProposal(invitation);
    }

    async acceptInvitation(jobId: string, freelancerId: string): Promise<{ message: string; }> {
        const invitation = await this._proposalRepository.findOne({
            jobId,
            freelancerId,
            isInvitation: true,
            status: "invited"
        });

        if(!invitation){
            throw createHttpError(HttpStatus.BAD_REQUEST, "No active invitation found");
        }
        invitation.status = "accepted";
        if (!invitation.invitation) {
            invitation.invitation = {};
        }
        invitation.invitation.respondedAt = new Date();
        await invitation.save();

        return {
            message: "Invitation accepted. Redirect freelancer to proposal page." 
        };
    }

    async getMyProposals(freelancerId: string, isInvitation: boolean): Promise<ProposalDTO[]> {
        const filter: FilterQuery<IProposalInvitationDocument> = { freelancerId };
        if (typeof isInvitation === "boolean") {
            filter.isInvitation = isInvitation;
        }
        const proposals = await this._proposalRepository.findWithDetail(filter);
        return proposals.map(mapProposal);
    }

    async getProposalsForClient(clientId: string, isInvitation: boolean): Promise<ProposalDTO[]> {
        const jobs = await  this._jobRepository.find({ clientId });
        if(!jobs.length) return [];

        const jobIds = jobs.map((j) => j._id);

        const query: FilterQuery<IProposalInvitationDocument> = { jobId: { $in: jobIds }};

        if(typeof isInvitation === "boolean") {
            query.isInvitation = isInvitation
        };

        const proposals = await this._proposalRepository.findWithDetail(query);

        return proposals.map(mapProposal);
    }
}
