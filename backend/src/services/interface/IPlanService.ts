import { planDTO } from "dtos/plan.dto";
import { DeleteResult, UpdateResult } from "mongoose";
import { IPlanDocument } from "types/plan.type";

export interface IPlanService {
    getPlans(userType?: string): Promise<planDTO[]>;
    getPlanById(id: string): Promise<planDTO>;
    createPlan(data: any): Promise<IPlanDocument>;
    updatePlan(id: string, data: any): Promise<UpdateResult>;
    deletePlan(id: string): Promise<DeleteResult>;
}