import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { IJobAssignmentService } from "./interface/IJobAssignmentService";
import { AssignmentMapper } from "mappers/jobAssignment.mapper";
import { AssignmentDto } from "dtos/jobAssignment.dto";
import { IJobAssignmentDocument, IMilestone, IMilestoneFile } from "types/jobAssignment/jobAssignment.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { VALID_BUDGET_STATUSES } from "constants/validBudgetStatuses";
import { IPaymentDocument } from "types/payment/payment.type";
import { IPaymentRepository } from "repositories/interfaces/IPaymentRepository";
import { AdminMilestoneMapper } from "mappers/adminMilestone.mapper";
import { AdminApprovedMilestoneDetailDto, AdminApprovedMilestoneDto } from "dtos/adminApprovedMilestoneDto";
import { AuthPayload } from "types/auth.type";
import { generateSignedUrl } from "utils/getSignedUrl.util";
import { FilterQuery } from "mongoose";
import { PaginatedResult } from "types/pagination";
import { AdminApprovedMilestoneDetailMapper } from "mappers/adminApprovedMilestone.mapper";
import { IWalletService } from "./interface/IWalletService";


export class JobAssignmentService implements IJobAssignmentService {
    constructor(
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _paymentRepository: IPaymentRepository,
        private _walletService: IWalletService
    ){};

    async getAssignments(jobId: string): Promise<AssignmentDto[]>{

        const assignments = await this._jobAssignmentRepository.findWithFreelancer({ jobId: jobId });

        return AssignmentMapper.mapList(assignments);
    }

    async addMilestones(assignmentId: string, milestones: IMilestone[]): Promise<AssignmentDto> {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.ASSIGNMENT_NOT_FOUND);
        }
        // to validate milestone(title and amount)
        for (const m of milestones) {
            if (!m.title || typeof m.title !== "string" || m.title.trim() === "") {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone title is required");
            }
            if (m.amount === undefined || typeof m.amount !== "number" || m.amount <= 0) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone amount must be a positive number");
            }
        }
        //sum of existing milestones
        const existingTotal = (assignment.milestones ?? [])
        .filter(m => VALID_BUDGET_STATUSES.includes(m.status))
        .reduce((sum, m) => sum + (m.amount || 0), 0);
        //sum of new milestones
        const incomingTotal = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);

        if(existingTotal + incomingTotal > assignment.amount) {
            throw createHttpError(HttpStatus.BAD_REQUEST, 
                `Milestones exceed assignment amount. Allowed: ${assignment.amount}, Request: ${existingTotal + incomingTotal}`
            );
        }
        const normalizeMilestones: IMilestone[] = milestones.map(m => ({
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

        return AssignmentMapper.mapAssignment(assignment)
    }

    async updateMilestone(assignmentId: string, milestoneId: string, payload: Partial<IMilestone>): Promise<AssignmentDto> {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.ASSIGNMENT_NOT_FOUND);
        }

        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        if(milestone.status !== "draft") {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Only draft milestones can be edited");
        }
        // to validate milestone(title and amount)
        if (payload.title !== undefined) {
            if (!payload.title || typeof payload.title !== "string" || payload.title.trim() === "") {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone title cannot be empty");
            }
        }
        // validate amount
        if(payload.amount !== undefined){
            if (typeof payload.amount !== "number" || payload.amount <= 0) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone amount must be a positive number");
            }
            const oldAmount = milestone.amount;
            const newAmount = payload.amount;

            const currentBudgetTotal = (assignment.milestones ?? [])
            .filter(m => VALID_BUDGET_STATUSES.includes(m.status))
            .reduce((sum, m) => sum + (m.amount || 0), 0);

            const recalculatedTotal = currentBudgetTotal - oldAmount + newAmount;

            if(recalculatedTotal > assignment.amount) {
                throw createHttpError(HttpStatus.BAD_REQUEST, 
                    `Milestones exceed assignment amount. Allowed: ${assignment.amount}, Requested: ${recalculatedTotal}`
                );
            }
        }
        Object.assign(milestone, {
            ...payload,
            updatedAt: new Date(),
        });

        await assignment.save();
        return AssignmentMapper.mapAssignment(assignment);
    }

    async cancelMilestone(assignmentId: string, milestoneId: string): Promise<AssignmentDto> {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);

        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);

        if(milestone.status !== "draft"){
            throw createHttpError(HttpStatus.BAD_REQUEST, "Only draft milestones can be cancelled");
        }

        milestone.status = "cancelled";
        milestone.updatedAt = new Date();

        await assignment.save();
        return AssignmentMapper.mapAssignment(assignment);
    }

    async submitWork(
        assignmentId: string, milestoneId: string, freelancerId: string, 
        submissionNote?: string, submissionFiles?: IMilestoneFile[]
    ): Promise<AssignmentDto> {

        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ASSIGNMENT_NOT_FOUND);
        if(assignment.freelancerId.toString() !== freelancerId){
            throw createHttpError(HttpStatus.FORBIDDEN, "Not allowed");
        }
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        if (milestone.status !== "funded" && milestone.status !== "changes_requested") {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone cannot be submitted in its current status.");
        }
        milestone.status = "submitted";
        milestone.submissionMessage = submissionNote || null;

        milestone.submissionFiles = submissionFiles || [];
        milestone.submittedAt = new Date();
        milestone.updatedAt = new Date();

        await assignment.save();

        return AssignmentMapper.mapAssignment(assignment);
    }

    async requestChange(assignmentId: string, milestoneId: string): Promise<AssignmentDto> {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ASSIGNMENT_NOT_FOUND);
        
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        if(milestone.status === "approved"){
            throw createHttpError(HttpStatus.BAD_REQUEST, "Only submitted milestones can have changes requested");
        }
        milestone.status = "changes_requested";
        milestone.updatedAt = new Date();
        await assignment.save();

        return AssignmentMapper.mapAssignment(assignment);
    }

    async approveMilestone(assignmentId: string, milestoneId: string): Promise<AssignmentDto> {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ASSIGNMENT_NOT_FOUND);
        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);

        milestone.status = "approved";
        milestone.updatedAt = new Date();
        await assignment.save();

        return AssignmentMapper.mapAssignment(assignment);
    }

    async disputeMilestone(
        assignmentId: string, milestoneId: string, currentUser: AuthPayload, reason?: string
    ): Promise<{ assignment: AssignmentDto; payment: IPaymentDocument; }> {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ASSIGNMENT_NOT_FOUND);

        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);

        const payment = await this._paymentRepository.findOne({ milestoneId: milestone._id });
        if(!payment) throw createHttpError(HttpStatus.NOT_FOUND, "Associated payment not found");

        if (payment.status !== "completed") {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Only completed payments can be disputed");
        }
        if (payment.isDisputed) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone is already under dispute");
        }
        if(currentUser.role === 'client' && milestone.status !== 'submitted') {
            throw createHttpError(HttpStatus.BAD_REQUEST, 'Client can only dispute after submission');
        }
        if(currentUser.role === 'freelancer' && milestone.status !== 'changes_requested') {
            throw createHttpError(HttpStatus.BAD_REQUEST, 'Freelancer can only dispute after change request');
        }
        if(!['client','freelancer'].includes(currentUser.role)) {
            throw createHttpError(HttpStatus.FORBIDDEN, 'Not authorized to dispute this milestone');
        }

        payment.isDisputed = true;
        payment.disputeReason = reason;
        payment.userId = currentUser._id;
        await payment.save();

        milestone.status = "disputed";
        milestone.updatedAt = new Date();
        await assignment.save();
        
        return { 
            assignment: AssignmentMapper.mapAssignment(assignment),
            payment,
        }
    }

    async getApprovedMilestones(search: string, page: number, limit: number): Promise<PaginatedResult<AdminApprovedMilestoneDto>> {
        const filter: FilterQuery<IJobAssignmentDocument> = {};
        if(search){
            filter.$or = [
                { "milestones.title": { $regex: search, $options: "i" } },
            ];

            const amount = Number(search);
            if (!Number.isNaN(amount)) {
                filter.$or.push({ "milestones.amount": amount });
            }
        }
        const result = await this._jobAssignmentRepository.findApprovedMilestonesPaginated(
            filter,
            { page, limit, sort: { createdAt: -1 } }
        );

        return {
            ...result,
            data: AdminMilestoneMapper.mapList(result.data)
        };
    }

    async getApprovedMilestoneById(
        assignmentId: string,
        milestoneId: string
    ): Promise<AdminApprovedMilestoneDetailDto> {

        const assignment =
            await this._jobAssignmentRepository.findApprovedMilestoneDetail(
            assignmentId,
            milestoneId
            );

        if (!assignment) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        }
        if(!assignment.milestones){
            throw createHttpError(HttpStatus.NOT_FOUND, "There are no milestones");
        }
        const milestone = assignment.milestones[0];

        if (!milestone.paymentId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Payment not created for this milestone");
        }

        return AdminApprovedMilestoneDetailMapper.map(assignment);
    }


    async getFileUrl(userId: string, assignmentId: string, milestoneId: string, key: string): Promise<{ url: string; }> {
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

        if(!assignment) throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ACCESS_DENIED);
        // generate temporary url for safety
        const url = await generateSignedUrl(key);

        return { url }
    }

    async getClientEscrowAndMilestones(clientId: string, page: number, limit: number) {

        const { milestones, total, totalPages } =
            await this._jobAssignmentRepository.getClientMilestones(clientId, page, limit);

        const assignments =
            await this._jobAssignmentRepository.findAssignmentsByClient(clientId);

        const totalContract = assignments.reduce(
            (sum, a) => sum + (a.amount || 0),
            0
        );

        const assignmentIds = assignments.map(a => a._id);

        const escrowStats =
            await this._walletService.getEscrowStatsForAssignments(assignmentIds);

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
}