import { ChatDTO } from "dtos/chat.dto";

export interface IChatService {
    getOrCreateChat(initiatorId: string, receiverId: string, jobId?: string): Promise<ChatDTO>;
    blockChat(chatId: string, reason: "job_completed" | "manual" | "policy"): Promise<ChatDTO>;
    getUserChats(userId: string): Promise<ChatDTO[]>;
}