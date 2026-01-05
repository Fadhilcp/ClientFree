import { PlanDetailAdminDTO, PlanDetailUserDTO, PlanTableDTO } from "../../dtos/plan.dto";
import { DeleteResult } from "mongoose";
import { PaginatedResult } from "../../types/pagination";
import { IPlan, IPlanDocument } from "../../types/plan.type";

export interface IPlanService {
    getActive(userType?: string): Promise<PlanDetailUserDTO[]>;
    getPlans(search: string, status: string, page: number,limit: number): Promise<PaginatedResult<PlanTableDTO>>;
    getPlanById(planId: string, role: string): Promise<PlanDetailUserDTO | PlanDetailAdminDTO>;
    createPlan(planData: IPlan): Promise<IPlanDocument>;
    updatePlan(planId: string, planData: Partial<IPlan>): Promise<PlanDetailAdminDTO>;
    deletePlan(planId: string): Promise<DeleteResult>;
}