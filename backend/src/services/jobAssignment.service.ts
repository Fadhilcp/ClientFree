import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { IJobAssignmentService } from "./interface/IJobAssignmentService";
import { AssignmentMapper } from "mappers/jobAssignment.mapper";
import { AssignmentDto } from "dtos/jobAssignment.dto";
import { IMilestone } from "types/jobAssignment.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { VALID_BUDGET_STATUSES } from "constants/validBudgetStatuses";

export class JobAssignmentService implements IJobAssignmentService {
    constructor(private jobAssignmentRepository: IJobAssignmentRepository){};

    async getAssignments(jobId: string): Promise<AssignmentDto[]>{

        const assignments = await this.jobAssignmentRepository.findWithFreelancer({ jobId: jobId });

        return AssignmentMapper.mapList(assignments);
    }

    async addMilestones(assignmentId: string, milestones: IMilestone[]): Promise<AssignmentDto> {
        const assignment = await this.jobAssignmentRepository.findById(assignmentId);
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
        const assignment = await this.jobAssignmentRepository.findById(assignmentId);
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
        const assignment = await this.jobAssignmentRepository.findById(assignmentId);
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

}