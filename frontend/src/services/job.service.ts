import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';
import { type JobDetailDTO } from '../types/job/job.dto';

class JobService {
    getJobs(status?: string, search?: string, page?: number, limit?: number) {
        return axios.get(endPoints.JOB.LIST(status, search, page, limit));
    }

    createJob(data: unknown) {
        return axios.post(endPoints.JOB.CREATE, data);
    }

    getMyJobs(status: string) {
        return axios.get(endPoints.JOB.MY_JOBS(status));
    }

    getFreelancerJob(status: string) {
        return axios.get(endPoints.JOB.FREELANCER_JOBS(status));
    }

    getJob(jobId: string) {
        return axios.get(endPoints.JOB.BY_ID(jobId));
    }

    updateJob(jobId: string, data: Partial<JobDetailDTO>) {
        return axios.put(endPoints.JOB.BY_ID(jobId), data);
    }

    deleteJob(jobId: string) {
        return axios.delete(endPoints.JOB.BY_ID(jobId));
    }

    addProposal(jobId: string, data: any) {
        return axios.post(endPoints.JOB.ADD_PROPOSAL(jobId), data);
    }

    updateStatus(jobId: string, status: string) {
        return axios.patch(endPoints.JOB.UPDATE_STATUS(jobId), { status });
    }

    startJob(jobId: string) {
        return axios.post(endPoints.JOB.START_JOB(jobId));
    }

    getInterestedJobs() {
        return axios.get(endPoints.JOB.GET_INTERESTED);
    }

    addInterestedJob(jobId: string) {
        return axios.post(endPoints.JOB.ADD_INTERESTED(jobId));
    }

    removeInterestedJob(jobId: string) {
        return axios.delete(endPoints.JOB.REMOVE_INTERESTED(jobId))
    }
}

export const jobService = new JobService();