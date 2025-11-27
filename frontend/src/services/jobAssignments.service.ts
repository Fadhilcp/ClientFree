import { endPoints } from '../config/endpoints'
import axios from '../lib/axios'
import type { MilestoneDto } from '../types/job/assignment.type';

class JobAssignmentService {
    getAssignemntsOfJob(jobId: string){
        return axios.get(endPoints.ASSIGNMENT.GET_JOB_ASSIGNMENTS(jobId));
    }

    updateMilestones(assignmentId: string, milestones: MilestoneDto[]){
        return axios.post(endPoints.ASSIGNMENT.UPDATE_MILESTONE(assignmentId), { milestones });
    }
}

export const jobAssignmentService = new JobAssignmentService();