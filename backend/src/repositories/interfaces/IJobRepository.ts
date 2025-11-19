import { IJobDocument } from "types/job.type";
import { IBaseRepository } from "./IBaseRepository";

// export interface IJobRepository extends IBaseRepository<IJobDocument>{};

export type IJobRepository = IBaseRepository<IJobDocument>;