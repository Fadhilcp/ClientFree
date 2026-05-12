import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';

class AIService{
    getJobSuggestions(title: string) {
        return axios.post(endPoints.AI.JOB_SUGGESTIONS, { title });
    }
}

export const aiService = new AIService();