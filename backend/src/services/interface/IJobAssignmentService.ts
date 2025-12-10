import { AdminApprovedMilestoneDto } from "dtos/adminApprovedMilestoneDto";
import { AssignmentDto } from "dtos/jobAssignment.dto";
import { AuthPayload } from "types/auth.type";
import { IMilestone, IMilestoneFile } from "types/jobAssignment.type";
import { IPaymentDocument } from "types/payment.type";

export interface IJobAssignmentService { 
    getAssignments(jobId: string): Promise<AssignmentDto[]>
    addMilestones(assignmentId: string, milestones:IMilestone[]): Promise<AssignmentDto>;
    updateMilestone(assignmentId: string, milestoneId: string, payload: Partial<IMilestone>): Promise<AssignmentDto>;
    cancelMilestone(assignmentId: string , milestoneId: string): Promise<AssignmentDto>;
    submitWork(
        assignmentId: string, milestoneId: string, freelancerId: string, 
        submissionNote?: string, 
        submissionFiles?: IMilestoneFile[]
    ): Promise<AssignmentDto>;
    requestChange(assignmentId: string, milestoneId: string, reason?: string): Promise<AssignmentDto>;
    approveMilestone(assignmentId: string, milestoneId: string): Promise<AssignmentDto>;
    disputeMilestone(
        assignmentId: string, milestoneId: string, currentUser: AuthPayload, reason?: string
    ): Promise<{ assignment: AssignmentDto, payment: IPaymentDocument }>;
    getApprovedMilestones(): Promise<AdminApprovedMilestoneDto[]>
}