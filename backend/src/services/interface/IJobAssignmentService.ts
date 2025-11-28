import { AssignmentDto } from "dtos/jobAssignment.dto";
import { IMilestone } from "types/jobAssignment.type";

export interface IJobAssignmentService { 
    getAssignments(jobId: string): Promise<AssignmentDto[]>
    addMilestones(assignmentId: string, milestones:IMilestone[]): Promise<AssignmentDto>;
    updateMilestone(assignmentId: string, milestoneId: string, payload: Partial<IMilestone>): Promise<AssignmentDto>;
    cancelMilestone(assignmentId: string , milestoneId: string): Promise<AssignmentDto>;
}