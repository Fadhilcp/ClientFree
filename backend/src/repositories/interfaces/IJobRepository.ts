import { IJobDocument } from "types/job.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery } from "mongoose";

export interface IJobRepository extends IBaseRepository<IJobDocument>{
    findWithSkills(filter: FilterQuery<IJobDocument>): Promise<IJobDocument[]>;
};

// export type IJobRepository = IBaseRepository<IJobDocument>;