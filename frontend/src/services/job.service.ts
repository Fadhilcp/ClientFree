import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';
import { type JobForm } from '../types/job/job.dto';

class JobService {
    getJobs(cursor: string | undefined, limit: number, status: string, search: string) {
        return axios.get(endPoints.JOB.LIST(search, status, cursor, limit));
    }

    createJob(data: unknown) {
        return axios.post(endPoints.JOB.CREATE, data);
    }

    getMyJobs(status: string, search: string, cursor: string | undefined, limit: number,) {
        return axios.get(endPoints.JOB.MY_JOBS(status, search, cursor, limit));
    }

    getFreelancerJob(status: string, search: string, cursor: string | undefined, limit: number,) {
        return axios.get(endPoints.JOB.FREELANCER_JOBS(status, search, cursor, limit));
    }

    getJob(jobId: string) {
        return axios.get(endPoints.JOB.BY_ID(jobId));
    }

    updateJob(jobId: string, data: Partial<JobForm>) {
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

    getInterestedJobs(cursor: string | undefined, limit: number, search: string) {
        return axios.get(endPoints.JOB.GET_INTERESTED(search, cursor, limit));
    }

    addInterestedJob(jobId: string) {
        return axios.post(endPoints.JOB.ADD_INTERESTED(jobId));
    }

    removeInterestedJob(jobId: string) {
        return axios.delete(endPoints.JOB.REMOVE_INTERESTED(jobId))
    }
}

export const jobService = new JobService();