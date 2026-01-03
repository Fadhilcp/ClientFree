import { endPoints } from "../config/endpoints"
import axios from "../lib/axios"

class MatchService {

    getBestMatchJobs(cursor: string | undefined, limit: number, search: string, filterQeury: string) {
        return axios.get(endPoints.MATCH.GET_BEST_JOBS(
                search, cursor, limit
            ) + (filterQeury ? `&${filterQeury}` : "")
        );
    }

    getBestMatchFreelancers(jobId: string, cursor: string | undefined, limit: number, search: string, filterQeury: string) {
        return axios.get(endPoints.MATCH.GET_BEST_FREELANCERS(
                jobId, search, cursor, limit
            ) + (filterQeury ? `&${filterQeury}` : "")
        );
    }
}

export const matchService = new MatchService();