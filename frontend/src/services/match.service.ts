import { endPoints } from "../config/endpoints"
import axios from "../lib/axios"

class MatchService {
    async getBestMatchJobs() {
        return axios.get(endPoints.MATCH.GET_BEST_JOBS);
    }

    async getBestMatchFreelancers(jobId: string) {
        return axios.get(endPoints.MATCH.GET_BEST_FREELANCERS(jobId));
    }
}

export const matchService = new MatchService();