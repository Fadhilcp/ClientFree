import { IJobDocument } from "../../types/job.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery } from "mongoose";

export interface IJobRepository extends IBaseRepository<IJobDocument>{
    findWithSkills(filter: FilterQuery<IJobDocument>): Promise<IJobDocument[]>;
    findByIdWithDetails(jobId: string): Promise<IJobDocument | null>;
    findWithSkillsPaginated(
        filter: FilterQuery<IJobDocument>,
        limit: number
    ): Promise<IJobDocument[]>
};