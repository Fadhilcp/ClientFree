import { PlanDetailAdminDTO, PlanDetailUserDTO, PlanTableDTO } from "dtos/plan.dto";
import { DeleteResult } from "mongoose";
import { PaginatedResult } from "types/pagination";
import { IPlan, IPlanDocument } from "types/plan.type";

export interface IPlanService {
    getActive(userType?: string): Promise<PlanDetailUserDTO[]>;
    getPlans(search: string, status: string, page: number,limit: number): Promise<PaginatedResult<PlanTableDTO>>;
    getPlanById(id: string, role: string): Promise<PlanDetailUserDTO | PlanDetailAdminDTO>;
    createPlan(data: IPlan): Promise<IPlanDocument>;
    updatePlan(id: string, data: Partial<IPlan>): Promise<PlanDetailAdminDTO>;
    deletePlan(id: string): Promise<DeleteResult>;
}