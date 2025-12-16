import type { FreelancerProfileDto } from "../user/freelancerProfile.dto";

export interface Milestone {
  title: string;
  amount: number;
  dueDate?: string;
  description?: string;
}

export interface MilestoneDto {
  id?: string;
  title: string;
  amount: number;
  dueDate: string;
  description: string;
  status?:
    | "draft"
    | "funded"
    | "submitted"
    | "changes_requested"
    | "approved"
    | "released"
    | "refunded"
    | "disputed"
    | "cancelled";
      submissionMessage?: string;

  submissionFiles?: {
      url: string;
      name: string;
      type: string;
      key: string;
  }[];

  submittedAt?: string;
  createdAt?: string;
  updateAt?: string;
  paymentId?: string;
}


export interface AssignmentTaskDto {
    id: string;
    title: string;
    status: "pending" | "inProgress" | "completed" | "cancelled";
    dueDate: string | null;
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
    milestones: MilestoneDto[];
    freelancer: FreelancerProfileDto;
}