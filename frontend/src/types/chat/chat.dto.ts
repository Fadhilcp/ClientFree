// types/chat/chat-list.dto.ts
export interface ChatListDTO {
  id: string;

  job?: {
    id: string;
    title: string;
    status: "open" | "active" | "completed" | "cancelled";
  } | null;

  otherUser: {
    id: string;
    name: string;
    username: string;
    profileImage?: string;
    role: "client" | "freelancer" | "admin";
    isVerified: boolean;
  };

  status: "active" | "closed" | "blocked";
  blockReason?: "job_completed" | "manual" | "subscription_expired" | null;
  isBlocked: boolean;

  lastMessageAt?: string | null;

  createdAt: string;
  updatedAt: string;
}