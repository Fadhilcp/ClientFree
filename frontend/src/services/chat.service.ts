import axios from '../lib/axios';
import { endPoints } from '../config/endpoints';

class ChatService {
    async getOrCreateChat(receiverId: string, jobId?: string) {
        return axios.post(endPoints.CHAT.CREATE_OR_GET, {
            receiverId,
            jobId,
        });
    }

    async getMyChats(search: string) {
        return axios.get(endPoints.CHAT.GET_MY_CHATS(search));
    }

    async blockChat(chatId: string, reason?: string) {
        return axios.patch(endPoints.CHAT.BLOCK(chatId), { reason });
    }
}

export const chatService = new ChatService();