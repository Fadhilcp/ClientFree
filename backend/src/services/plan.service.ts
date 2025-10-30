import { IPlanRepository } from "repositories/interfaces/IPlanRepository";
import { IPlanService } from "./interface/IPlanService";
import { IPlan, IPlanDocument } from "types/plan.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { DeleteResult, UpdateResult } from "mongoose";
import { mapPlan } from "mappers/plan.mapper";
import { planDTO } from "dtos/plan.dto";

export class PlanService implements IPlanService {
    constructor(private planRepository: IPlanRepository) {}

    async getPlans(userType?: string): Promise<planDTO[]> {
        const filter = userType ? { userType, active: true} : { active: true };
        const plans = await this.planRepository.find(filter);

        if(!plans.length){
            throw createHttpError(HttpStatus.NOT_FOUND, "No plans available");
        }
        return plans.map(mapPlan)
    }

    async getPlanById(id: string): Promise<planDTO> {
        const plan = await this.planRepository.findById(id);
        if(!plan) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PLAN_NOT_FOUND);
        return mapPlan(plan);
    }

    // change any to suitable type
    async createPlan(data: IPlan): Promise<IPlanDocument> {
        return this.planRepository.create(data)
    }

    // change the data any into suitable type
    async updatePlan(id: string, data: Partial<IPlan>): Promise<UpdateResult> {
        const updated = await this.planRepository.updateOne({_id: id},{data})
        if(!updated) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PLAN_NOT_FOUND);
        return updated;
    }

    async deletePlan(id: string): Promise<DeleteResult> {
        const deleted = await this.planRepository.deleteOne({ _id: id });
        if(!deleted) throw createHttpError(HttpStatus.OK, HttpResponse.PLAN_NOT_FOUND);
        return deleted;
    }
}