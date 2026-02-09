import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';

class ReviewService {
    createReview(reviewData: { jobId: string; rating: number; title: string; comment: string;}) {
        return axios.post(endPoints.REVEIW.CREATE, reviewData);
    }

    getUserReviews(userId: string, role: string, page: number, limit: number){
        return axios.get(endPoints.REVEIW.GET_USER_REVIEW(userId, role, page, limit));
    }

    hasReviewed(jobId: string) {
        return axios.get(endPoints.REVEIW.HAS_REVIEWED(jobId));
    }
}

export const reviewService = new ReviewService();