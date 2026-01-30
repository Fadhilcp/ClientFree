import { ChatDTO, ChatListDTO } from "../../dtos/chat.dto";

export interface IChatService {
    getOrCreateChat(initiatorId: string, receiverId: string, jobId?: string): Promise<ChatDTO>;
    blockChat(chatId: string, reason: "job_completed" | "manual" | "subscription_expired"): Promise<ChatDTO>;
    getUserChats(userId: string, search: string): Promise<ChatListDTO[]>;
    updateBlockStatus(chatId: string): Promise<ChatDTO>;
    updateBlockStatusByJobId(jobId: string): Promise<void>;
}