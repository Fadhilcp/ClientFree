import { IJobAssignmentDocument } from "../../types/jobAssignment/jobAssignment.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery, PopulateOptions, Types } from "mongoose";
import { PopulatedAssignment } from "../../types/jobAssignment/jobAssignment.populated";
import { ApprovedMilestoneAssignment } from "../../types/jobAssignment/jobAssignment.approvedMilestone";
import { IJobDocument } from "types/job.type";

export interface IJobAssignmentRepository extends IBaseRepository<IJobAssignmentDocument>{
    findWithJobDetail(filter: FilterQuery<IJobAssignmentDocument>): Promise<IJobAssignmentDocument[] | null>
    findWithFreelancer(filter: FilterQuery<IJobAssignmentDocument>): Promise<IJobAssignmentDocument[]>;
    findWithJobDetailPaginated(
            assignmentFilter: FilterQuery<IJobAssignmentDocument>, 
            jobFilter: FilterQuery<IJobDocument>,
            limit: number
        ): Promise<(IJobAssignmentDocument & { job: IJobDocument })[]>
    findApprovedMilestonesPaginated(
        filter: FilterQuery<IJobAssignmentDocument>,
        options: {
            page?: number;
            limit?: number;
            sort?: Record<string, 1 | -1>;
            populate?: PopulateOptions | (string | PopulateOptions)[];
        }
        ): Promise<{
            data: ApprovedMilestoneAssignment[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>;

    findApprovedMilestoneDetail(assignmentId: string, milestoneId: string): Promise<PopulatedAssignment | null>;

    getClientMilestones(clientId: string, page: number, limit: number)
    : Promise<{ milestones: IJobAssignmentDocument[], total: number, totalPages: number}>;
    findAssignmentsByClient(clientId: string): Promise<{ _id: Types.ObjectId; amount: number; }[]>;
    countUpcomingClientMilestones(clientId: string): Promise<number>;

    getPendingClearanceByFreelancer(freelancerId: string): Promise<number>;
    getAllEscrowMilestonesAggregate(search: string, page: number, limit: number)
            : Promise<{ milestones: IJobAssignmentDocument[], total: number, totalPages: number }>;
};