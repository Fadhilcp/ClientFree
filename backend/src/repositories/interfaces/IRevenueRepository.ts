import { IRevenueDocument } from "types/revenue.type";
import { IBaseRepository } from "./IBaseRepository";

// export interface IRevenueRepository extends IBaseRepository<IRevenueDocument>{};

export type IRevenueRepository = IBaseRepository<IRevenueDocument>;