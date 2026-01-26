export type ChatStatusDTO = "active" | "closed" | "blocked";

export type ChatBlockReasonDTO =
  | "job_completed"
  | "manual"
  | "policy";

export interface ChatDTO {
  id: string;

  jobId: string | null;

  participants: string[];

  status: ChatStatusDTO;
  blockReason?: ChatBlockReasonDTO | null;

  lastMessageAt?: string;

  createdAt: string;
  updatedAt: string;
}
