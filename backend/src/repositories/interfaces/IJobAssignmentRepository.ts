import { IJobAssignmentDocument } from "types/jobAssignment.type";
import { IBaseRepository } from "./IBaseRepository";

// export interface IJobAssignmentRepository extends IBaseRepository<IJobAssignmentDocument>{};

export type IJobAssignmentRepository = IBaseRepository<IJobAssignmentDocument>;