import { endPoints } from '../config/endpoints'
import axios from '../lib/axios'

class ClarificationService {

    async addMessage(jobId: string, message: string) {
        return axios.post(endPoints.CLARIFICATION.ADD_MESSAGE(jobId), { message });
    }

    async getClarificationBoard(jobId: string) {
        return axios.get(endPoints.CLARIFICATION.GET_BOARD(jobId));
    }

    async closeClarificationBoard(jobId: string) {
        return axios.patch(endPoints.CLARIFICATION.CLOSE_BOARD(jobId));
    }
}

export const clarificationService = new ClarificationService();