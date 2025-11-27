import { FreelancerProfileDto } from "./freelancerProfile.dto";

export interface AssignmentTaskDto {
    id: string;
    title: string;
    status: "pending" | "inProgress" | "completed" | "cancelled";
    dueDate: string | null;
}

export interface AssignmentMilestoneDto {
    title: string;
    description?: string | null;
    amount: number;
    dueDate: string | null;
    paymentId?: string | null;
    status:
        | "draft"
        | "funded"
        | "submitted"
        | "changes_requested"
        | "approved"
        | "released"
        | "refunded"
        | "disputed"
        | "cancelled";
    createdAt: string;
    updatedAt: string;
}

export interface FreelancerDto {
    id: string;
    username: string;
    name: string;
    email: string;
    profileImage: string | null;
    phone: string | null;
}

export interface AssignmentDto {
    id: string;
    amount: number;
    tasks: AssignmentTaskDto[];
    status: "pending" | "active" | "onHold" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
    milestones: AssignmentMilestoneDto[];
    freelancer: FreelancerProfileDto;
}