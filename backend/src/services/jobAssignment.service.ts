import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { IJobAssignmentService } from "./interface/IJobAssignmentService";
import { AssignmentMapper } from "mappers/jobAssignment.mapper";
import { AssignmentDto } from "dtos/jobAssignment.dto";
import { IMilestone } from "types/jobAssignment.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";

export class JobAssignmentService implements IJobAssignmentService {
    constructor(private jobAssignmentRepository: IJobAssignmentRepository){};

    async getAssignments(jobId: string): Promise<AssignmentDto[]>{

        const assignments = await this.jobAssignmentRepository.findWithFreelancer({ jobId: jobId });

        return AssignmentMapper.mapList(assignments);
    }

    async addMilestones(assignmentId: string, milestones: IMilestone[]): Promise<AssignmentDto> {
        console.log("🚀 ~ JobAssignmentService ~ addMilestones ~ milestones:", milestones)
        const assignment = await this.jobAssignmentRepository.findById(assignmentId);
        if(!assignment){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.ASSIGNMENT_NOT_FOUND);
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