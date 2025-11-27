import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { IJobAssignmentService } from "./interface/IJobAssignmentService";
import { AssignmentMapper } from "mappers/jobAssignment.mapper";
import { AssignmentDto } from "dtos/jobAssignment.dto";
import { IMilestone } from "types/jobAssignment.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";

export class JobAssignmentService implements IJobAssignmentService {
    constructor(private jobAssignmentRepository: IJobAssignmentRepository){};

    async getAssignments(jobId: string): Promise<AssignmentDto[]>{

        const assignments = await this.jobAssignmentRepository.findWithFreelancer({ jobId: jobId });

        return AssignmentMapper.mapList(assignments);
    }

    async addMilestones(assignmentId: string, milestones: IMilestone[]): Promise<AssignmentDto> {
        const assignment = await this.jobAssignmentRepository.findById(assignmentId);
        if(!assignment){
            throw createHttpError(HttpStatus.BAD_REQUEST,"Job assignment not found");
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

}