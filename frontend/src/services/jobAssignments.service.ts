import { endPoints } from '../config/endpoints'
import axios from '../lib/axios'
import type { Milestone, MilestoneDto } from '../types/job/assignment.type';

class JobAssignmentService {
    getAssignemntsOfJob(jobId: string){
        return axios.get(endPoints.ASSIGNMENT.GET_JOB_ASSIGNMENTS(jobId));
    }

    addMilestones(assignmentId: string, milestones: MilestoneDto[]){
        return axios.post(endPoints.ASSIGNMENT.ADD_MILESTONE(assignmentId), { milestones });
    }

    updateMilestone(assignmentId: string, milestoneId: string, milestone: Milestone){
        return axios.patch(endPoints.ASSIGNMENT.UPDATE_MILESTONE(assignmentId, milestoneId), { milestone } );
    }

    cancelMilestone(assignmentId: string, milestoneId: string){
        return axios.patch(endPoints.ASSIGNMENT.CANCEL_MILESTONE(assignmentId, milestoneId));
    }

    submitWork(assignmentId: string, milestoneId: string, formData: FormData){
        return axios.post(endPoints.ASSIGNMENT.SUBMIT_MILESTONE(assignmentId, milestoneId), formData);
    }

    requestChange(assignmentId: string, milestoneId: string){
        return axios.patch(endPoints.ASSIGNMENT.REQUEST_CHANGE(assignmentId, milestoneId));
    }

    approveMilestone(assignmentId: string, milestoneId: string){
        return axios.patch(endPoints.ASSIGNMENT.APPROVE(assignmentId, milestoneId));
    }

    diputeMilestone(assignmentId: string, milestoneId: string){
        return axios.patch(endPoints.ASSIGNMENT.DISPUTE(assignmentId, milestoneId));
    }
}

export const jobAssignmentService = new JobAssignmentService();