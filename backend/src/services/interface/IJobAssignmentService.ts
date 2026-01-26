import { AdminApprovedMilestoneDetailDto, AdminApprovedMilestoneDto } from "../../dtos/adminApprovedMilestoneDto";
import { AdminEscrowMilestoneDTO } from "../../dtos/adminEscrowMilestone.dto";
import { AssignmentDto, ClientEscrowAndMilestonesResponse } from "../../dtos/jobAssignment.dto";
import { AuthPayload } from "../../types/auth.type";
import { IJobAssignmentDocument, IMilestone, IMilestoneFile } from "../../types/jobAssignment/jobAssignment.type";
import { PaginatedResult } from "../../types/pagination";
import { IPaymentDocument } from "../../types/payment/payment.type";

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

    getApprovedMilestones(search: string, page: number, limit: number): Promise<PaginatedResult<AdminApprovedMilestoneDto>>;
    getFileUrl(userId: string, assignmentId: string, milestoneId: string, key: string): Promise<{ url: string }>;
    getApprovedMilestoneById(assignmentId: string, milestoneId: string): Promise<AdminApprovedMilestoneDetailDto>;

    getClientEscrowAndMilestones(clientId: string, page: number, limit: number): Promise<ClientEscrowAndMilestonesResponse<IJobAssignmentDocument>>;
    getAllEscrowMilestones(search: string, page: number, limit: number): Promise<PaginatedResult<AdminEscrowMilestoneDTO>>
}