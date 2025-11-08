import { PlanDetailAdminDTO, PlanDetailUserDTO, PlanTableDTO } from "dtos/plan.dto";
import { DeleteResult, UpdateResult } from "mongoose";
import { PaginatedResult } from "types/pagination";
import { IPlanDocument } from "types/plan.type";

export interface IPlanService {
    getActive(userType?: string): Promise<PlanDetailUserDTO[]>;
    getPlans(search: string, status: string, page: number,limit: number): Promise<PaginatedResult<PlanTableDTO>>;
    getPlanById(id: string, role: string): Promise<PlanDetailUserDTO | PlanDetailAdminDTO>;
    createPlan(data: any): Promise<IPlanDocument>;
    updatePlan(id: string, data: any): Promise<PlanDetailAdminDTO>;
    deletePlan(id: string): Promise<DeleteResult>;
}