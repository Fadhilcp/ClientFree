"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const proposal_mapper_1 = require("../mappers/proposal.mapper");
const mongoose_1 = require("mongoose");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const razorpay_config_1 = require("../config/razorpay.config");
const env_config_1 = require("../config/env.config");
const crypto_1 = __importDefault(require("crypto"));
const embedding_helper_1 = require("../helpers/embedding.helper");
const similarity_helper_1 = require("../helpers/similarity.helper");
const proposalWorkloadLimits_1 = require("../constants/proposalWorkloadLimits");
class ProposalService {
    constructor(_proposalRepository, _jobRepository, _jobAssignmentRepository, _addOnRepository, _paymentRepository, _revenueRepository, _userRepository, _notificationService) {
        this._proposalRepository = _proposalRepository;
        this._jobRepository = _jobRepository;
        this._jobAssignmentRepository = _jobAssignmentRepository;
        this._addOnRepository = _addOnRepository;
        this._paymentRepository = _paymentRepository;
        this._revenueRepository = _revenueRepository;
        this._userRepository = _userRepository;
        this._notificationService = _notificationService;
    }
    ;
    async createProposal(jobId, freelancerId, payload) {
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Job not found");
        if (job.status !== "open") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "Proposals can only be submitted to open jobs");
        }
        // passing option upgrade id
        const addOn = await this._validateOptionalUpgrade(payload.optionalUpgradeId);
        // check the proposal is comes through invitation
        const invitation = await this._proposalRepository.findOne({
            jobId,
            freelancerId,
            isInvitation: true
        });
        // if it is invitation
        if (invitation) {
            // const proposal = await this._handleInvitation(invitation, jobId, payload);
            // return await this._finalizeProposalResponse(proposal, freelancerId, jobId, addOn);
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "You are already invited to this job. Please check your invitations.");
        }
        // check the freelancer already submitted or not
        const existing = await this._proposalRepository.findOne({ jobId, freelancerId });
        if (existing) {
            if (existing.upgradeStatus !== "pending") {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "Proposal already submitted");
            }
            return await this._retryUpgrade(existing, freelancerId, payload);
        }
        const workloadWarning = await this._checkFreelancerWorkload(freelancerId);
        const user = await this._assertProposalLimit(freelancerId);
        const proposal = await this._createFreshProposal(jobId, freelancerId, payload);
        if (user.limits.proposalsRemaining < 999999) {
            await this._userRepository.findByIdAndUpdate(freelancerId, {
                $inc: { "limits.proposalsRemaining": -1 },
            });
        }
        const response = await this._finalizeProposalResponse(proposal, freelancerId, jobId, addOn);
        return {
            ...response,
            warning: workloadWarning
        };
    }
    async _retryUpgrade(proposal, freelancerId, payload) {
        if (proposal.upgradeStatus === "paid") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "Upgrade already completed for this proposal");
        }
        proposal.bidAmount = payload.bidAmount;
        proposal.duration = payload.duration;
        proposal.description = payload.description;
        proposal.milestones = payload.milestones;
        if (!payload.optionalUpgradeId) {
            // user removed upgrade
            proposal.upgradeStatus = "none";
            proposal.optionalUpgrade = undefined;
            await proposal.save();
            return {
                proposal: (0, proposal_mapper_1.mapProposal)(proposal),
                paymentOrder: null,
                paymentId: null,
                addOn: null
            };
        }
        const addon = await this._validateOptionalUpgrade(payload.optionalUpgradeId);
        // overwrite previous upgrade intent
        proposal.upgradeStatus = "pending";
        proposal.optionalUpgrade = undefined;
        await proposal.save();
        return await this._finalizeProposalResponse(proposal, freelancerId, proposal.jobId.toString(), addon);
    }
    async _validateOptionalUpgrade(addonId) {
        if (!addonId)
            return null;
        const addon = await this._addOnRepository.findOne({
            _id: addonId,
            category: "bid",
            userType: { $in: ["freelancer"] },
            isActive: true,
        });
        if (!addon) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid or inactive add-on");
        }
        return addon;
    }
    async _handleInvitation(invitation, jobId, payload) {
        invitation.isInvitation = false;
        invitation.status = "pending";
        invitation.bidAmount = payload.bidAmount;
        invitation.duration = payload.duration;
        invitation.description = payload.description;
        invitation.milestones = payload.milestones;
        invitation.optionalUpgrade = undefined;
        invitation.upgradeStatus = payload.optionalUpgradeId ? "pending" : "none";
        const updated = await invitation.save();
        await this._jobRepository.findByIdAndUpdate(jobId, {
            $push: { proposals: updated._id },
            $inc: { proposalCount: 1 }
        });
        return updated;
    }
    async _finalizeProposalResponse(proposal, freelancerId, jobId, addon) {
        if (!addon) {
            return {
                proposal: (0, proposal_mapper_1.mapProposal)(proposal),
                paymentOrder: null,
                paymentId: null,
                addOn: null
            };
        }
        const { razorpayOrder, payment } = await this._createAddOnPayment(proposal, freelancerId, addon, jobId);
        return {
            proposal: (0, proposal_mapper_1.mapProposal)(proposal),
            paymentOrder: razorpayOrder,
            paymentId: payment._id.toString(),
            addOn: {
                id: addon._id.toString(),
                price: addon.price,
                name: addon.displayName
            }
        };
    }
    async _createAddOnPayment(proposal, freelancerId, addon, jobId) {
        const razorpay = (0, razorpay_config_1.getRazorpayInstance)();
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
    async _assertProposalLimit(freelancerId) {
        const user = await this._userRepository.findById(freelancerId);
        if (!user) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "User not found");
        }
        if (user.limits.proposalsRemaining <= 0) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Proposal limit reached. Upgrade your plan.");
        }
        return user;
    }
    async _createFreshProposal(jobId, freelancerId, payload) {
        const proposal = await this._proposalRepository.create({
            bidAmount: payload.bidAmount,
            duration: payload.duration,
            description: payload.description,
            milestones: payload.milestones,
            jobId,
            freelancerId,
            status: "pending",
            isInvitation: false,
            // =============
            upgradeStatus: payload.optionalUpgradeId ? "pending" : "none",
            // ==============
            optionalUpgrade: undefined,
        });
        await this._jobRepository.findByIdAndUpdate(jobId, {
            $push: { proposals: proposal._id },
            $inc: { proposalCount: 1 },
        });
        return proposal;
    }
    // to check how many pending or active assignment the freelancer has
    async _checkFreelancerWorkload(freelancerId) {
        const activeAssignmentsCount = await this._jobAssignmentRepository.count({
            freelancerId,
            status: { $in: ["pending", "active"] }
        });
        if (activeAssignmentsCount >= proposalWorkloadLimits_1.PROPOSAL_WORKLOAD_LIMITS.BLOCK) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "You’ve reached the maximum number of active jobs. Complete or close a job to apply for more.");
        }
        if (activeAssignmentsCount >= proposalWorkloadLimits_1.PROPOSAL_WORKLOAD_LIMITS.WARN) {
            return "You already have several ongoing jobs. Make sure you can handle another one.";
        }
        return null;
    }
    async verifyUpgradePayment({ paymentRecordId, razorpay_order_id, razorpay_payment_id, razorpay_signature, }) {
        // payment document id(db)
        if (!paymentRecordId)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Payment record id is needed");
        const payment = await this._paymentRepository.findById(paymentRecordId);
        if (!payment)
            throw (0, httpError_util_1.createHttpError)(404, "Payment record not found");
        const expected = crypto_1.default
            .createHmac("sha256", env_config_1.env.RAZORPAY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");
        if (expected !== razorpay_signature) {
            payment.status = "failed";
            await payment.save();
            throw (0, httpError_util_1.createHttpError)(400, "Payment signature mismatch");
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
        startDay.setUTCHours(0, 0, 0, 0);
        if (!payment.referenceId)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid payment record: missing referenceId");
        const addOn = await this._addOnRepository.findById(payment.referenceId);
        if (!addOn)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.ADD_ON_NOT_FOUND);
        const proposalId = payment.proposalId;
        if (!proposalId)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid payment: missing proposal reference");
        await this._proposalRepository.findByIdAndUpdate(proposalId.toString(), {
            upgradeStatus: "paid",
            optionalUpgrade: {
                addonId: addOn._id,
                name: addOn.key,
                price: addOn.price
            }
        });
        return true;
    }
    async getProposalsForJob(jobId, status, isInvitation, page, limit) {
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Job not found");
        const filter = { jobId };
        if (status) {
            filter.status = status;
        }
        else {
            filter.status = { $ne: "withdrawn" };
        }
        if (isInvitation !== undefined)
            filter.isInvitation = isInvitation === true;
        const currentPage = page ? page : 1;
        const pageLimit = limit ? limit : 10;
        const { proposals, total, totalPages } = await this._proposalRepository.findByJob(filter, page ?? 1, limit ?? 10);
        return {
            data: proposals.map(proposal_mapper_1.mapProposal),
            total,
            totalPages,
            page: currentPage,
            limit: pageLimit
        };
    }
    async getById(proposalId) {
        const proposal = await this._proposalRepository.findById(proposalId);
        if (!proposal)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Proposal not found");
        return (0, proposal_mapper_1.mapProposal)(proposal);
    }
    async updateProposal(proposalId, proposalData) {
        const proposal = await this._proposalRepository.findByIdAndUpdate(proposalId, proposalData);
        if (!proposal)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Proposal not found");
        return (0, proposal_mapper_1.mapProposal)(proposal);
    }
    async updateStatus(proposalId, status) {
        const allowed = ["pending", "shortlisted", "accepted", "rejected", "invited"];
        if (!allowed.includes(status)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid proposal status");
        }
        const proposal = await this._proposalRepository.findByIdAndUpdate(proposalId, { status });
        if (!proposal)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Proposal not found");
        return (0, proposal_mapper_1.mapProposal)(proposal);
    }
    async acceptProposal(proposalId) {
        const proposal = await this._proposalRepository.findByIdAndUpdate(proposalId, { status: 'accepted' });
        if (!proposal) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.PROPOSAL_NOT_FOUND);
        }
        const job = await this._jobRepository.findById(proposal.jobId.toString());
        if (!job) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        }
        if (job.acceptedProposalIds.length > 0) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "Job already has an accepted proposal");
        }
        await this._jobAssignmentRepository.create({
            jobId: job._id,
            freelancerId: proposal.freelancerId,
            proposalId: proposal._id,
            amount: proposal.bidAmount || 0,
            tasks: [],
            status: "pending"
        });
        await this._jobRepository.findByIdAndUpdate(job._id.toString(), { $push: { acceptedProposalIds: proposal._id } });
        // Auto notification
        await this._notificationService.createNotification({
            scope: "users",
            userIds: [new mongoose_1.Types.ObjectId(proposal.freelancerId)],
            category: "proposal_accepted",
            subject: "You’ve been hired",
            message: `Your proposal has been accepted for the job "${job.title}".`,
            sendAs: "in-app",
        });
    }
    async inviteFreelancer(jobId, clientId, freelancerId, invitationData) {
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        if (job.clientId.toString() !== clientId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "You cannot invite freelancers to this job");
        }
        const existing = await this._proposalRepository.findOne({ jobId, freelancerId });
        if (existing) {
            // avoid duplicate
            if (existing.isInvitation && existing.status === "invited") {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "Freelancer is already invited");
            }
            if (!existing.isInvitation) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "Freelancer already submitted a proposal");
            }
        }
        ;
        const user = await this._assertInviteLimit(clientId);
        const invitation = await this._proposalRepository.create({
            freelancerId,
            jobId,
            isInvitation: true,
            invitedBy: clientId,
            invitation: invitationData,
            status: "invited",
        });
        if (user.limits.invitesRemaining < 999999) {
            await this._userRepository.findByIdAndUpdate(clientId, {
                $inc: { "limits.invitesRemaining": -1 },
            });
        }
        // Auto notification
        await this._notificationService.createNotification({
            scope: "users",
            userIds: [new mongoose_1.Types.ObjectId(freelancerId)],
            category: "proposal_received",
            subject: "You’ve been invited to a job",
            message: `The client has invited you to apply for the job "${job.title}". 
                        Review the invitation and submit your proposal if you’re interested.`,
            sendAs: "in-app",
        });
        return (0, proposal_mapper_1.mapProposal)(invitation);
    }
    async _assertInviteLimit(clientId) {
        const user = await this._userRepository.findById(clientId);
        if (!user) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "User not found");
        }
        if (user.limits.invitesRemaining <= 0) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Invitation limit reached. Upgrade your plan.");
        }
        return user;
    }
    async acceptInvitation(jobId, freelancerId) {
        const invitation = await this._proposalRepository.findOne({
            jobId,
            freelancerId,
            isInvitation: true,
            status: "invited"
        });
        if (!invitation) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "No active invitation found");
        }
        const job = await this._jobRepository.findById(jobId);
        if (!job || job.isDeleted) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Job not found or no longer available");
        }
        if (job.status !== "open") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Cannot accept invitation for a closed job");
        }
        invitation.isInvitation = false;
        invitation.status = "pending";
        if (!invitation.bidAmount && job.payment?.budget) {
            invitation.bidAmount = job.payment.budget;
        }
        invitation.invitation = {
            ...invitation.invitation,
            respondedAt: new Date()
        };
        await invitation.save();
        await this._jobRepository.findByIdAndUpdate(jobId, {
            $inc: { proposalCount: 1 },
            $addToSet: { proposals: invitation._id },
        });
        return {
            message: "Invitation accepted. A proposal has been created with the job budget. You can now review and edit your bid before submitting."
        };
    }
    async getMyProposals(freelancerId, isInvitation, search, limit, cursor) {
        const filter = { freelancerId, status: { $ne: "withdrawn" } };
        if (typeof isInvitation === "boolean") {
            filter.isInvitation = isInvitation;
        }
        //cursor - for infinite scroll
        if (cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { $lt: cursor };
        }
        if (search?.trim()) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { description: regex },
                { "invitation.title": regex },
                { "invitation.message": regex },
                { status: regex }
            ];
        }
        const proposals = await this._proposalRepository.findWithDetailPaginated(filter, limit);
        const nextCursor = proposals.length > 0
            ? proposals[proposals.length - 1]._id.toString()
            : null;
        return {
            proposals: proposals.map(proposal_mapper_1.mapProposal),
            nextCursor
        };
    }
    async getProposalsForClient(clientId, isInvitation, search, limit, cursor) {
        const jobs = await this._jobRepository.find({ clientId });
        if (!jobs.length)
            return { proposals: [], nextCursor: null };
        const jobIds = jobs.map((j) => j._id);
        const query = { jobId: { $in: jobIds } };
        if (cursor && cursor !== "undefined" && cursor !== "null") {
            query._id = { $lt: cursor };
        }
        if (typeof isInvitation === "boolean") {
            query.isInvitation = isInvitation;
        }
        ;
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
            proposals: proposals.map(proposal_mapper_1.mapProposal),
            nextCursor
        };
    }
    async aiShortlistTopProposals(jobId, topN) {
        if (topN > 10) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Maximum ten is allowed");
        }
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        const proposals = await this._proposalRepository.find({
            jobId,
            status: "pending",
        });
        if (proposals.length === 0) {
            return { shortlisted: 0 };
        }
        const jobText = `${job.title}\n${job.description || ''}`;
        const jobEmbedding = await (0, embedding_helper_1.getEmbedding)(jobText);
        const scored = [];
        for (const proposal of proposals) {
            const proposalText = proposal.description || "";
            const proposalEmbedding = await (0, embedding_helper_1.getEmbedding)(proposalText);
            const score = (0, similarity_helper_1.cosineSimilarity)(jobEmbedding, proposalEmbedding);
            scored.push({
                proposalId: proposal._id,
                score,
            });
        }
        scored.sort((a, b) => b.score - a.score);
        const shortlistedIds = scored
            .slice(0, topN)
            .map((p) => p.proposalId);
        const result = await this._proposalRepository.updateMany({ _id: { $in: shortlistedIds } }, { status: "shortlisted" });
        return {
            shortlisted: result.modifiedCount,
            proposalIds: shortlistedIds,
        };
    }
    async cancelProposal(proposalId, freelancerId) {
        const proposal = await this._proposalRepository.findById(proposalId);
        if (!proposal) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.PROPOSAL_NOT_FOUND);
        }
        if (proposal.freelancerId.toString() !== freelancerId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Not allowed to cancel this proposal");
        }
        if (proposal.status === "withdrawn") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Proposal already withdrawn");
        }
        if (!["pending", "shortlisted"].includes(proposal.status)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Only pending or shortlisted proposals can be cancelled");
        }
        const job = await this._jobRepository.findById(proposal.jobId.toString());
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        if (job.status !== "open") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Cannot cancel proposal");
        }
        proposal.status = "withdrawn";
        await proposal.save();
        return (0, proposal_mapper_1.mapProposal)(proposal);
    }
    async withdrawInvitation(proposalId, clientId) {
        const proposal = await this._proposalRepository.findById(proposalId);
        if (!proposal) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.PROPOSAL_NOT_FOUND);
        }
        // must be an invitation
        if (!proposal.isInvitation || proposal.status !== "invited") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "This is not an active invitation");
        }
        // only inviter can withdraw
        if (proposal.invitedBy?.toString() !== clientId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Not allowed to withdraw this invitation");
        }
        const job = await this._jobRepository.findById(proposal.jobId.toString());
        if (!job) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        }
        if (job.status !== "open") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Cannot withdraw invitation for this job");
        }
        proposal.status = "withdrawn";
        await proposal.save();
        return (0, proposal_mapper_1.mapProposal)(proposal);
    }
    async getProposalIsSubmitted(jobId, freelancerId) {
        const proposal = await this._proposalRepository.findOne({
            jobId,
            freelancerId,
        });
        if (!proposal) {
            return {
                status: "NONE",
                message: "You have not submitted a proposal for this job.",
            };
        }
        if (proposal.isInvitation) {
            return {
                status: "INVITED",
                message: "You are invited to this job. Please check your invitations.",
                proposalId: proposal._id.toString(),
            };
        }
        if (proposal.upgradeStatus === "pending") {
            return {
                status: "UPGRADE_PENDING",
                message: "Your proposal has been submitted, but the optional upgrade is still pending. You can resubmit the bid to add or modify the upgrade.",
                proposalId: proposal._id.toString(),
            };
        }
        return {
            status: "SUBMITTED",
            message: "You have already submitted a proposal for this job.",
            proposalId: proposal._id.toString(),
        };
    }
}
exports.ProposalService = ProposalService;
