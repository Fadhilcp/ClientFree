export interface ClarificationBoardDto {
  id: string;
  jobId: string;

  status: "open" | "closed";

  messageCount: number;

  lastMessageAt?: string | null;

  isDeleted?: boolean;
  deletedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}
