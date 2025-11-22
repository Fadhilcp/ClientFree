import { IJobDocument } from "types/job.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery } from "mongoose";

export interface IJobRepository extends IBaseRepository<IJobDocument>{
    findWithSkills(filter: FilterQuery<IJobDocument>): Promise<IJobDocument[]>;
    findByIdWithSkills(jobId: string): Promise<IJobDocument | null>;
};

// export type IJobRepository = IBaseRepository<IJobDocument>;