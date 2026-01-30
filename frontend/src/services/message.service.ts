import axios from '../lib/axios';
import { endPoints } from '../config/endpoints';

class MessageService {
    async sendMessage(chatId: string, payload: {
        type: 'text' | 'file' | 'voice' | 'video_call' | 'voice_call';
        content?: string;
        file?: any;
        callDetails?: any;
    } | FormData ) {
        return axios.post(endPoints.MESSAGE.SEND(chatId), payload, {
            headers:
                payload instanceof FormData
                    ? { "Content-Type": "multipart/form-data" }
                    : {},
        });
    }

    async getChatMessages(chatId: string) {
        return axios.get(endPoints.MESSAGE.GET_BY_CHAT(chatId));
    }

    async markAsRead(chatId: string) {
        return axios.patch(endPoints.MESSAGE.MARK_READ(chatId));
    }

    async getFileSignedUrl(messageId: string) {
        return axios.get(endPoints.MESSAGE.SIGNED_URL(messageId));
    }

    async deleteMessage(messageId: string) {
        return axios.delete(endPoints.MESSAGE.DELETE(messageId));
    }
}

export const messageService = new MessageService();
