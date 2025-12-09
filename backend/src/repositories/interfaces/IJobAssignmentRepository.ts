import { IJobAssignmentDocument } from "types/jobAssignment.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery } from "mongoose";

export interface IJobAssignmentRepository extends IBaseRepository<IJobAssignmentDocument>{
    findWithJobDetail(filter: FilterQuery<IJobAssignmentDocument>): Promise<IJobAssignmentDocument[] | null>
    findWithFreelancer(filter: FilterQuery<IJobAssignmentDocument>): Promise<IJobAssignmentDocument[]>
    findApprovedMilestones(): Promise<IJobAssignmentDocument[]>;
};