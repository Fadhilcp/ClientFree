import { IPlanDocument } from "types/plan.type";
import { IBaseRepository } from "./IBaseRepository";

// export interface IPlanRepository extends IBaseRepository<IPlanDocument> {};

export type IPlanRepository = IBaseRepository<IPlanDocument>;