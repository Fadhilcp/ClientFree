export interface ClarificationMessageDto {
  id: string;
  boardId: string;

  sender: {
    id: string;
    username: string;
    name: string;
    email: string;
    profileImage?: string | null;
    role: string;
  };
  senderRole: "freelancer" | "client";

  message: string;

  isDeleted?: boolean;
  deletedAt?: string | null;

  sentAt?: string | null;

  createdAt: string;
  updatedAt: string;
}