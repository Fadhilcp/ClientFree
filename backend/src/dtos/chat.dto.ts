export type ChatStatusDTO = "active" | "closed" | "blocked";

export type ChatBlockReasonDTO =
  | "job_completed"
  | "manual"
  | "subscription_expired";

export interface ChatDTO {
  id: string;

  jobId: string | null;

  participants: string[];

  status: ChatStatusDTO;
  blockReason?: ChatBlockReasonDTO | null;
  isBlocked: boolean;

  lastMessageAt?: string;

  createdAt: string;
  updatedAt: string;
}

// ======================
export interface ChatUserDTO {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  role: "client" | "freelancer" | "admin";
  isVerified: boolean;
}

export interface ChatJobDTO {
  id: string;
  title: string;
  status: "open" | "active" | "completed" | "cancelled";
}

export interface ChatListDTO {
  id: string;

  job?: ChatJobDTO | null;

  otherUser: ChatUserDTO;

  status: ChatStatusDTO;

  isBlocked: boolean;
  blockReason?: ChatBlockReasonDTO | null;

  lastMessageAt?: string;

  createdAt: string;
  updatedAt: string;
}
