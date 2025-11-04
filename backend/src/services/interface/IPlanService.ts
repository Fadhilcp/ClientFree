import { PlanDTO } from "dtos/plan.dto";
import { DeleteResult, UpdateResult } from "mongoose";
import { PaginatedResult } from "types/pagination";
import { IPlanDocument } from "types/plan.type";

export interface IPlanService {
    getActive(userType?: string): Promise<PlanDTO[]>;
    getPlans(page: number,limit: number): Promise<PaginatedResult<PlanDTO>>;
    getPlanById(id: string): Promise<PlanDTO>;
    createPlan(data: any): Promise<IPlanDocument>;
    updatePlan(id: string, data: any): Promise<UpdateResult>;
    deletePlan(id: string): Promise<DeleteResult>;
}