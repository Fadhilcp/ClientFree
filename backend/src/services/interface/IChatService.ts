export interface IChatService {
    getOrCreateChat(initiatorId: string, receiverId: string, jobId?: string): Promise<any>;
    blockChat(chatId: string, reason: "job_completed" | "manual" | "policy"): Promise<any>;
    getUserChats(userId: string): Promise<any>;
}