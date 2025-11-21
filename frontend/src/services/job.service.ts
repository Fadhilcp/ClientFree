import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';
import { type JobForm } from '../types/job/job.dto';

class JobService {
    getJobs(search: string, status: string, page: number, limit: number) {
        return axios.get(endPoints.JOB.LIST(search, status, page, limit));
    }

    createJob(data: unknown) {
        return axios.post(endPoints.JOB.CREATE, data);
    }

    getMyJobs(status: string) {
        return axios.get(endPoints.JOB.MY_JOBS(status));
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
}

export const jobService = new JobService();