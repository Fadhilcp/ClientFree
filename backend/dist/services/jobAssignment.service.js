"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobAssignmentService = void 0;
const jobAssignment_mapper_1 = require("../mappers/jobAssignment.mapper");
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const validBudgetStatuses_1 = require("../constants/validBudgetStatuses");
const adminMilestone_mapper_1 = require("../mappers/adminMilestone.mapper");
const getSignedUrl_util_1 = require("../utils/getSignedUrl.util");
const adminApprovedMilestone_mapper_1 = require("../mappers/adminApprovedMilestone.mapper");
const escrowMilestone_mapper_1 = require("../mappers/escrowMilestone.mapper");
const user_constants_1 = require("../constants/user.constants");
class JobAssignmentService {
    constructor(_jobAssignmentRepository, _paymentRepository, _walletService) {
        this._jobAssignmentRepository = _jobAssignmentRepository;
        this._paymentRepository = _paymentRepository;
        this._walletService = _walletService;
    }
    ;
    async getAssignments(jobId) {
        const assignments = await this._jobAssignmentRepository.findWithFreelancer({ jobId: jobId });
        return jobAssignment_mapper_1.AssignmentMapper.mapList(assignments);
    }
    async addMilestones(assignmentId, milestones) {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.ASSIGNMENT_NOT_FOUND);
        }
        // to validate milestone(title and amount)
        for (const m of milestones) {
            if (!m.title || typeof m.title !== "string" || m.title.trim() === "") {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Milestone title is required");
            }
            if (m.amount === undefined || typeof m.amount !== "number" || m.amount <= 0) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Milestone amount must be a positive number");
            }
        }
        //sum of existing milestones
        const existingTotal = (assignment.milestones ?? [])
            .filter(m => validBudgetStatuses_1.VALID_BUDGET_STATUSES.includes(m.status))
            .reduce((sum, m) => sum + (m.amount || 0), 0);
        //sum of new milestones
        const incomingTotal = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
        if (existingTotal + incomingTotal > assignment.amount) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, `Milestones exceed assignment amount. Allowed: ${assignment.amount}, Request: ${existingTotal + incomingTotal}`);
        }
        const normalizeMilestones = milestones.map(m => ({
            title: m.title,
            description: m.description ?? undefined,
            amount: m.amount,
            dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
            paymentId: undefined,
            status: "draft",
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        assignment.milestones?.push(...normalizeMilestones);
        assignment.updatedAt = new Date();
        await assignment.save();
        return jobAssignment_mapper_1.AssignmentMapper.mapAssignment(assignment);
    }
    async updateMilestone(assignmentId, milestoneId, payload) {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.ASSIGNMENT_NOT_FOUND);
        }
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if (!milestone)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.MILESTONE_NOT_FOUND);
        if (milestone.status !== "draft") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Only draft milestones can be edited");
        }
        // to validate milestone(title and amount)
        if (payload.title !== undefined) {
            if (!payload.title || typeof payload.title !== "string" || payload.title.trim() === "") {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Milestone title cannot be empty");
            }
        }
        // validate amount
        if (payload.amount !== undefined) {
            if (typeof payload.amount !== "number" || payload.amount <= 0) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Milestone amount must be a positive number");
            }
            const oldAmount = milestone.amount;
            const newAmount = payload.amount;
            const currentBudgetTotal = (assignment.milestones ?? [])
                .filter(m => validBudgetStatuses_1.VALID_BUDGET_STATUSES.includes(m.status))
                .reduce((sum, m) => sum + (m.amount || 0), 0);
            const recalculatedTotal = currentBudgetTotal - oldAmount + newAmount;
            if (recalculatedTotal > assignment.amount) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, `Milestones exceed assignment amount. Allowed: ${assignment.amount}, Requested: ${recalculatedTotal}`);
            }
        }
        Object.assign(milestone, {
            ...payload,
            updatedAt: new Date(),
        });
        await assignment.save();
        return jobAssignment_mapper_1.AssignmentMapper.mapAssignment(assignment);
    }
    async cancelMilestone(assignmentId, milestoneId) {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if (!assignment)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.MILESTONE_NOT_FOUND);
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if (!milestone)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.MILESTONE_NOT_FOUND);
        if (milestone.status !== "draft") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Only draft milestones can be cancelled");
        }
        milestone.status = "cancelled";
        milestone.updatedAt = new Date();
        await assignment.save();
        return jobAssignment_mapper_1.AssignmentMapper.mapAssignment(assignment);
    }
    async submitWork(assignmentId, milestoneId, freelancerId, submissionNote, submissionFiles) {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if (!assignment)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.ASSIGNMENT_NOT_FOUND);
        if (assignment.freelancerId.toString() !== freelancerId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Not allowed");
        }
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if (!milestone)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.MILESTONE_NOT_FOUND);
        if (milestone.status !== "funded" && milestone.status !== "changes_requested") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Milestone cannot be submitted in its current status.");
        }
        milestone.status = "submitted";
        milestone.submissionMessage = submissionNote || null;
        milestone.submissionFiles = submissionFiles || [];
        milestone.submittedAt = new Date();
        milestone.updatedAt = new Date();
        await assignment.save();
        return jobAssignment_mapper_1.AssignmentMapper.mapAssignment(assignment);
    }
    async requestChange(assignmentId, milestoneId) {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if (!assignment)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.ASSIGNMENT_NOT_FOUND);
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if (!milestone)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.MILESTONE_NOT_FOUND);
        if (milestone.status === "approved") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Only submitted milestones can have changes requested");
        }
        milestone.status = "changes_requested";
        milestone.updatedAt = new Date();
        await assignment.save();
        return jobAssignment_mapper_1.AssignmentMapper.mapAssignment(assignment);
    }
    async approveMilestone(assignmentId, milestoneId) {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if (!assignment)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.ASSIGNMENT_NOT_FOUND);
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if (!milestone)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.MILESTONE_NOT_FOUND);
        milestone.status = "approved";
        milestone.updatedAt = new Date();
        await assignment.save();
        return jobAssignment_mapper_1.AssignmentMapper.mapAssignment(assignment);
    }
    async disputeMilestone(assignmentId, milestoneId, currentUser, reason) {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if (!assignment)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.ASSIGNMENT_NOT_FOUND);
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if (!milestone)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.MILESTONE_NOT_FOUND);
        const payment = await this._paymentRepository.findOne({ milestoneId: milestone._id });
        if (!payment)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Associated payment not found");
        if (payment.status !== "completed") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Only completed payments can be disputed");
        }
        if (payment.isDisputed) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Milestone is already under dispute");
        }
        if (currentUser.role === user_constants_1.UserRole.CLIENT && milestone.status !== 'submitted') {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Client can only dispute after submission');
        }
        if (currentUser.role === user_constants_1.UserRole.FREELANCER && milestone.status !== 'changes_requested') {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Freelancer can only dispute after change request');
        }
        if (![user_constants_1.UserRole.CLIENT, user_constants_1.UserRole.FREELANCER].includes(currentUser.role)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, 'Not authorized to dispute this milestone');
        }
        payment.isDisputed = true;
        payment.disputeReason = reason;
        payment.userId = currentUser._id;
        await payment.save();
        milestone.status = "disputed";
        milestone.updatedAt = new Date();
        await assignment.save();
        return {
            assignment: jobAssignment_mapper_1.AssignmentMapper.mapAssignment(assignment),
            payment,
        };
    }
    async getApprovedMilestones(search, page, limit) {
        const filter = {};
        if (search) {
            filter.$or = [
                { "milestones.title": { $regex: search, $options: "i" } },
            ];
            const amount = Number(search);
            if (!Number.isNaN(amount)) {
                filter.$or.push({ "milestones.amount": amount });
            }
        }
        const result = await this._jobAssignmentRepository.findApprovedMilestonesPaginated(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: adminMilestone_mapper_1.AdminMilestoneMapper.mapList(result.data)
        };
    }
    async getApprovedMilestoneById(assignmentId, milestoneId) {
        const assignment = await this._jobAssignmentRepository.findApprovedMilestoneDetail(assignmentId, milestoneId);
        if (!assignment) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.MILESTONE_NOT_FOUND);
        }
        if (!assignment.milestones) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "There are no milestones");
        }
        const milestone = assignment.milestones[0];
        if (!milestone.paymentId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Payment not created for this milestone");
        }
        return adminApprovedMilestone_mapper_1.AdminApprovedMilestoneDetailMapper.map(assignment);
    }
    async getFileUrl(userId, assignmentId, milestoneId, key) {
        const assignment = await this._jobAssignmentRepository.findWithJobDetail({
            _id: assignmentId,
            milestones: {
                $elemMatch: {
                    _id: milestoneId,
                    "submissionFiles.key": key
                }
            },
            $or: [
                { freelancerId: userId },
                { "jobId.clientId": userId }
            ]
        });
        if (!assignment)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, responseMessage_constant_1.HttpResponse.ACCESS_DENIED);
        // generate temporary url for safety
        const url = await (0, getSignedUrl_util_1.generateSignedUrl)(key);
        return { url };
    }
    async getClientEscrowAndMilestones(clientId, page, limit) {
        const { milestones, total, totalPages } = await this._jobAssignmentRepository.getClientMilestones(clientId, page, limit);
        const assignments = await this._jobAssignmentRepository.findAssignmentsByClient(clientId);
        const totalContract = assignments.reduce((sum, a) => sum + (a.amount || 0), 0);
        const assignmentIds = assignments.map(a => a._id);
        const escrowStats = await this._walletService.getEscrowStatsForAssignments(assignmentIds);
        return {
            summary: {
                totalContract,
                fundedInEscrow: escrowStats.funded,
                released: escrowStats.released,
                remaining: totalContract - escrowStats.released
            },
            milestones,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        };
    }
    async getAllEscrowMilestones(search, page, limit) {
        const { milestones, total, totalPages } = await this._jobAssignmentRepository.getAllEscrowMilestonesAggregate(search, page, limit);
        return {
            data: milestones.map(escrowMilestone_mapper_1.mapEscrowMilestone),
            total,
            page,
            limit,
            totalPages,
        };
    }
}
exports.JobAssignmentService = JobAssignmentService;
