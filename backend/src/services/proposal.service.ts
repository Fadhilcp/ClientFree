import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { IProposalRepository } from "repositories/interfaces/IProposalInvitation";
import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { CreateProposalResponse, IInvitationDetails, IProposalInvitation, IProposalInvitationDocument, ProposalStatus } from "types/proposalInvitation.type";
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
import { IRazoryOrderResponse } from "types/razorpay.types";
import { env } from "config/env.config";
import crypto from 'crypto';
import { IRevenueRepository } from "repositories/interfaces/IRevenueRepository";

export class ProposalService implements IProposalService {
    constructor(
        private _proposalRepository: IProposalRepository, 
        private _jobRepository: IJobRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _addOnRepository: IAddOnRepository,
        private _paymentRepository: IPaymentRepository,
        private _revenueRepository: IRevenueRepository,
    ){};

    async createProposal(jobId: string, freelancerId: string, payload: IProposalInvitation): Promise<CreateProposalResponse> {
        const job = await this._jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, "Job not found");
        const { bidAmount, duration, description, milestones, optionalUpgrades } = payload;

        let selectedAddOn = null;

        if(optionalUpgrades) {
            selectedAddOn = await this._addOnRepository.findOne({
                _id: optionalUpgrades,
                category: "bid",
                userType: { $in: ["freelancer"]},
                isActive: true
            });

            if(!selectedAddOn) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid or inactive add-on");
            }
        }

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

            return {
                proposal: mapProposal(updated),
                paymentOrder: null,
                paymentId: null,
                addOn: null
            };
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
            jobId,
            freelancerId,
            status: "pending",
            isInvitation: false,
            optionalUpgrades: [],
        });
        // increment proposalCount on job
        await this._jobRepository.findByIdAndUpdate(jobId, {
            $push: { proposals: proposal._id },
            $inc: { proposalCount: 1 }
        } as UpdateQuery<IJobDocument> );

        if (!selectedAddOn) {
            return {
                proposal: mapProposal(proposal),
                paymentOrder: null,
                paymentId: null,
                addOn: null
            };
        }

        const razorpay = getRazorpayInstance();

        const razorpayOrder = await razorpay.orders.create({
            amount: selectedAddOn.price * 100,
            currency: "INR",
            receipt: `addon_${proposal._id}`,
            notes: {
                proposalId: proposal._id.toString(),
                freelancerId,
                addonId: selectedAddOn._id.toString()
            }
        });

        const payment = await this._paymentRepository.create({
            type: "subscription",
            status: "pending",
            amount: selectedAddOn.price,
            currency: "INR",
            provider: "razorpay",
            providerOrderId: razorpayOrder.id,
            jobId,
            freelancerId,
            userId: freelancerId,
            referenceId: selectedAddOn._id.toString(),
            proposalId: proposal._id,
        });

        return {
            proposal: mapProposal(proposal),
            paymentOrder: razorpayOrder,
            paymentId: payment._id.toString(),
            addOn: {
                id: selectedAddOn._id.toString(),
                price: selectedAddOn.price,
                name: selectedAddOn.displayName
            }
        };
    }

    async verifyUpgradePayment({
                paymentRecordId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            }: IRazoryOrderResponse) {
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
        
        if(!payment.referenceId) throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid payment record: missing referenceId");
        const addOn = await this._addOnRepository.findById(payment.referenceId);
        if(!addOn) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ADD_ON_NOT_FOUND);
        
        const proposalId = payment.proposalId;
        if(!proposalId) throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid payment: missing proposal reference");

        await this._proposalRepository.findByIdAndUpdate(proposalId.toString(), {
            optionalUpgrades: [
                {
                    addonId: addOn._id,
                    name: addOn.key,
                    price: addOn.price
                }
            ]
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
