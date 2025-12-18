import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { IProposalRepository } from "repositories/interfaces/IProposalInvitation";
import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { CreateProposalResponse, IInvitationDetails, IProposalInvitation, IProposalInvitationDocument, IProposalInvitationPayload, ProposalStatus } from "types/proposalInvitation.type";
import { IProposalService } from "./interface/IProposalService";
import { mapProposal } from "mappers/proposal.mapper";
import { ProposalDTO } from "dtos/proposal.dto";
import { FilterQuery, UpdateQuery } from "mongoose";
import { IJobDocument } from "types/job.type";
import { HttpResponse } from "constants/responseMessage.constant";
import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { IAddOnRepository } from "repositories/interfaces/IAddOnsRepository";
import { IPaymentRepository } from "repositories/interfaces/IPaymentRepository";
import { getRazorpayInstance } from "config/razorpay.config";
import { IRazoryPaymentResponse } from "types/razorpay.types";
import { env } from "config/env.config";
import crypto from 'crypto';
import { IRevenueRepository } from "repositories/interfaces/IRevenueRepository";
import { IAddOnDocument } from "types/addOns.type";
import { Orders } from "razorpay/dist/types/orders";
import { IPaymentDocument } from "types/payment.type";
import { IUserRepository } from "repositories/interfaces/IUserRepository";

export class ProposalService implements IProposalService {
    constructor(
        private _proposalRepository: IProposalRepository, 
        private _jobRepository: IJobRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _addOnRepository: IAddOnRepository,
        private _paymentRepository: IPaymentRepository,
        private _revenueRepository: IRevenueRepository,
        private _userRepository: IUserRepository,
    ){};

    async createProposal(
        jobId: string, freelancerId: string, payload: IProposalInvitationPayload
    ): Promise<CreateProposalResponse> {
        console.log("🚀 ~ ProposalService ~ createProposal ~ payload:", payload)

        const job = await this._jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, "Job not found");
        if(job.status !== "open") {
            throw createHttpError(HttpStatus.CONFLICT, "Proposals can only be submitted to open jobs");
        }
        // passing option upgrade id
        const addOn = await this._validateOptionalUpgrade(payload.optionalUpgradeId)
        // check the proposal is comes through invitation
        const invitation = await this._proposalRepository.findOne({
            jobId,
            freelancerId,
            isInvitation: true
        });
        // if it is invitation
        if (invitation) {
            const proposal = await this._handleInvitation(invitation, jobId, payload);
            return await this._finalizeProposalResponse(proposal, freelancerId, jobId, addOn);
        }
        // check the freelancer already submitted or not
        const existing = await this._proposalRepository.findOne({ jobId, freelancerId });
        if (existing) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Proposal already submitted");
        }

        const proposal = await this._createFreshProposal(jobId, freelancerId, payload);
        return await this._finalizeProposalResponse(proposal, freelancerId, jobId, addOn)
    }

    private async _validateOptionalUpgrade(addonId?: string): Promise<IAddOnDocument | null> {
        if (!addonId) return null;

        const addon = await this._addOnRepository.findOne({
            _id: addonId,
            category: "bid",
            userType: { $in: ["freelancer"] },
            isActive: true,
        });

        if (!addon) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid or inactive add-on");
        }

        return addon;
    }

    private async _handleInvitation(
        invitation: IProposalInvitationDocument,
        jobId: string,
        payload: IProposalInvitationPayload
    ): Promise<IProposalInvitationDocument> {
        invitation.isInvitation = false;
        invitation.status = "pending";
        invitation.bidAmount = payload.bidAmount;
        invitation.duration = payload.duration;
        invitation.description = payload.description;
        invitation.milestones = payload.milestones;
        invitation.optionalUpgrade = undefined;

        const updated = await invitation.save();

        await this._jobRepository.findByIdAndUpdate(jobId, {
            $push: { proposals: updated._id },
            $inc: { proposalCount: 1 }
        } as UpdateQuery<IJobDocument>);

        return updated;
    }

    private async _finalizeProposalResponse(
        proposal: IProposalInvitationDocument,
        freelancerId: string,
        jobId: string,
        addon: IAddOnDocument | null,
    ): Promise<CreateProposalResponse> {

        if (!addon) {
            return {
                proposal: mapProposal(proposal),
                paymentOrder: null,
                paymentId: null,
                addOn: null
            };
        }

        const { razorpayOrder, payment } = await this._createAddOnPayment(
            proposal,
            freelancerId,
            addon,
            jobId
        );

        return {
            proposal: mapProposal(proposal),
            paymentOrder: razorpayOrder,
            paymentId: payment._id.toString(),
            addOn: {
                id: addon._id.toString(),
                price: addon.price,
                name: addon.displayName
            }
        };
    }

    private async _createAddOnPayment(
        proposal: IProposalInvitationDocument, freelancerId: string, addon: IAddOnDocument, jobId: string
    ): Promise<{ razorpayOrder: Orders.RazorpayOrder, payment: IPaymentDocument }> {
        const razorpay = getRazorpayInstance();

        const razorpayOrder = await razorpay.orders.create({
            amount: addon.price * 100,
            currency: "INR",
            receipt: `addon_${proposal._id}`,
            notes: {
                proposalId: proposal._id.toString(),
                freelancerId,
                addonId: addon._id.toString(),
            },
        });

        const payment = await this._paymentRepository.create({
            type: "subscription",
            status: "pending",
            amount: addon.price,
            currency: "INR",
            provider: "razorpay",
            providerOrderId: razorpayOrder.id,
            freelancerId,
            userId: freelancerId,
            jobId,
            referenceId: addon._id.toString(),
            proposalId: proposal._id,
        });

        return { razorpayOrder, payment };
    }
    
    private async _createFreshProposal(
        jobId: string,
        freelancerId: string,
        payload: IProposalInvitationPayload
    ): Promise<IProposalInvitationDocument> {
        const proposal = await this._proposalRepository.create({
            bidAmount: payload.bidAmount,
            duration: payload.duration,
            description: payload.description,
            milestones: payload.milestones,
            jobId,
            freelancerId,
            status: "pending",
            isInvitation: false,
            optionalUpgrade: undefined,
        });

        await this._jobRepository.findByIdAndUpdate(jobId, {
            $push: { proposals: proposal._id },
            $inc: { proposalCount: 1 },
        } as UpdateQuery<IJobDocument> );

        return proposal;
    }

    async verifyUpgradePayment({
                paymentRecordId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            }: IRazoryPaymentResponse ) {
        // payment document id(db)
        if(!paymentRecordId) throw createHttpError(HttpStatus.BAD_REQUEST, "Payment record id is needed");
        const payment = await this._paymentRepository.findById(paymentRecordId);
        if (!payment) throw createHttpError(404, "Payment record not found");

        const expected = crypto
            .createHmac("sha256", env.RAZORPAY_SECRET as string)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expected !== razorpay_signature) {
            payment.status = "failed";
            await payment.save();
            throw createHttpError(400, "Payment signature mismatch");
        }

        payment.status = "completed";
        payment.providerPaymentId = razorpay_payment_id;
        payment.providerSignature = razorpay_signature;
        payment.paymentDate = new Date();
        await payment.save();
        // create revenue
        await this._revenueRepository.create({
            type: "addOn",
            source: "freelancer",
            amount: payment.amount,
            currency: payment.currency,
            referencePaymentId: payment._id, 
            referenceId: payment.referenceId, // addOn id
            method: payment.method || "razorpay",
            provider: "razorpay",
            providerPaymentId: razorpay_payment_id,
            gatewayFee: 0,
            status: "completed"
        });

        const startDay = new Date();
        startDay.setUTCHours(0, 0, 0, 0)
        
        
        if(!payment.referenceId) throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid payment record: missing referenceId");
        const addOn = await this._addOnRepository.findById(payment.referenceId);
        if(!addOn) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ADD_ON_NOT_FOUND);
        
        const proposalId = payment.proposalId;
        if(!proposalId) throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid payment: missing proposal reference");

        await this._proposalRepository.findByIdAndUpdate(proposalId.toString(), {
            optionalUpgrade: {
                addonId: addOn._id,
                name: addOn.key,
                price: addOn.price
            }
        });
        return true;
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

    async getMyProposals(
        freelancerId: string, isInvitation: boolean, limit: number, cursor?: string
    ): Promise<{ proposals : ProposalDTO[], nextCursor: string | null }> {

        const filter: FilterQuery<IProposalInvitationDocument> = { freelancerId };
        if (typeof isInvitation === "boolean") {
            filter.isInvitation = isInvitation;
        }
        //cursor - for infinite scroll
        if(cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { $lt: cursor };
        }


        const proposals = await this._proposalRepository.findWithDetailPaginated(filter, limit);

        const nextCursor = proposals.length > 0 
        ? proposals[proposals.length - 1]._id.toString()
        : null;

        return {
            proposals: proposals.map(mapProposal),
            nextCursor
        };
    }

    async getProposalsForClient(
        clientId: string, isInvitation: boolean, search: string, limit: number, cursor?: string
    ): Promise<{ proposals: ProposalDTO[], nextCursor: string | null }> {

        const jobs = await  this._jobRepository.find({ clientId });
        if(!jobs.length) return { proposals: [], nextCursor: null };

        const jobIds = jobs.map((j) => j._id);

        const query: FilterQuery<IProposalInvitationDocument> = { jobId: { $in: jobIds }};

        if(cursor && cursor !== "undefined" && cursor !== "null") {
            query._id = { $lt: cursor };
        }
        
        if(typeof isInvitation === "boolean") {
            query.isInvitation = isInvitation
        };
        
        // search
        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");

            // search jobs by title
            const matchedJobs = await this._jobRepository.find({
                _id: { $in: jobIds },
                title: regex
            });

            const matchedJobIds = matchedJobs.map(j => j._id);

            // search freelancers by name
            const matchedFreelancers = await this._userRepository.find({
                $or: [
                    { username: regex },
                    { name: regex }
                ]
            });

            const matchedFreelancerIds = matchedFreelancers.map(f => f._id);
            // to search
            query.$or = [];

            if (matchedJobIds.length > 0) {
                query.$or.push({ jobId: { $in: matchedJobIds } });
            }

            if (matchedFreelancerIds.length > 0) {
                query.$or.push({ freelancerId: { $in: matchedFreelancerIds } });
            }

            if (query.$or.length === 0) {
                return { proposals: [], nextCursor: null };
            }
        }
        const proposals = await this._proposalRepository.findWithDetailPaginated(query, limit);
        
        const nextCursor = proposals.length > 0 
        ? proposals[proposals.length - 1]._id.toString()
        : null;

        return {
            proposals: proposals.map(mapProposal), 
            nextCursor
        }
    }
}
