import { IJobAssignmentDocument } from "types/jobAssignment.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery, PopulateOptions, SortOrder } from "mongoose";

export interface IJobAssignmentRepository extends IBaseRepository<IJobAssignmentDocument>{
    findWithJobDetail(filter: FilterQuery<IJobAssignmentDocument>): Promise<IJobAssignmentDocument[] | null>
    findWithFreelancer(filter: FilterQuery<IJobAssignmentDocument>): Promise<IJobAssignmentDocument[]>;
    findWithJobDetailPaginated(
                filter: FilterQuery<IJobAssignmentDocument>, limit: number
            ): Promise<IJobAssignmentDocument[]>;
    findApprovedMilestonesPaginated(
        filter: FilterQuery<IJobAssignmentDocument>,
        options: {
            page?: number;
            limit?: number;
            sort?: Record<string, SortOrder>;
            populate?: PopulateOptions | (string | PopulateOptions)[];
        }
        ): Promise<{
            data: IJobAssignmentDocument[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>;

    findApprovedMilestoneDetail(assignmentId: string, milestoneId: string): Promise<IJobAssignmentDocument | null>;
};