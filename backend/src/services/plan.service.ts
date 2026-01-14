import { IPlanRepository } from "../repositories/interfaces/IPlanRepository";
import { IPlanService } from "./interface/IPlanService";
import { IPlan, IPlanDocument } from "../types/plan.type";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { DeleteResult, FilterQuery } from "mongoose";
import { mapPlan } from "../mappers/plan.mapper";
import { PlanDetailAdminDTO, PlanDetailUserDTO, PlanTableDTO } from "../dtos/plan.dto";
import { getRazorpayInstance } from "../config/razorpay.config";
import { PaginatedResult } from "../types/pagination";
import { stripe } from "../config/stripe.config";

export class PlanService implements IPlanService {
    constructor(private _planRepository: IPlanRepository) {}

    async getActive(userType?: string): Promise<PlanDetailUserDTO[]> {
        const filter = userType ? { userType, active: true} : { active: true };
        const plans = await this._planRepository.find(filter);

        if(!plans.length){
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.NO_PLANS);
        }
        return plans.map(plan => mapPlan(plan, true, false))
    }

    async getPlans(search: string, status: string, page: number, limit: number): Promise<PaginatedResult<PlanTableDTO>> {

        const filter: FilterQuery<IPlanDocument> = {};

        if(status && status !== 'All'){
            filter.active = status === 'Active';
        }
        if(search){
            filter.$or = [
                { planName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ]
        }
        const result = await this._planRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(plan => mapPlan(plan, false))
        };
    }

    async getPlanById(planId: string, role: string): Promise<PlanDetailAdminDTO | PlanDetailUserDTO> {
        const plan = await this._planRepository.findById(planId);
        if(!plan) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PLAN_NOT_FOUND);
        return mapPlan(plan, true, role === 'admin');
    }

    async createPlan(planData: IPlan): Promise<IPlanDocument> {

        const existingPlan = await this._planRepository.findOne({ planName: planData.planName });

        if (existingPlan) {
            throw createHttpError(HttpStatus.CONFLICT, `Plan "${planData.planName}" already exists`);
        }

        const product = await stripe.products.create({
            name: planData.planName,
            metadata: {
            userType: planData.userType,
            },
        });

        const monthlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: planData.priceMonthly * 100,
            currency: "inr",
            recurring: { interval: "month" },
        });

        const yearlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: planData.priceYearly * 100,
            currency: "inr",
            recurring: { interval: "year" },
        });

        const plan = await this._planRepository.create({
            ...planData,
            stripeProductId: product.id,
            stripePriceIdMonthly: monthlyPrice.id,
            stripePriceIdYearly: yearlyPrice.id,
        });

        return plan;
    }

    async updatePlan(planId: string, planData: Partial<IPlan>): Promise<PlanDetailAdminDTO> {

        const plan = await this._planRepository.findById(planId);
        if(!plan) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PLAN_NOT_FOUND);

        const updatedData: Partial<IPlan> = { ...planData };

        if(planData.planName && planData.planName !== plan.planName) {
            await stripe.products.update(plan.stripeProductId, {
                name: planData.planName,
            });
        }
        // monthly price
        if(planData.priceMonthly && planData.priceMonthly !== plan.priceMonthly) {

            const monthlyPrice = await stripe.prices.create({
                product: plan.stripeProductId,
                unit_amount: planData.priceMonthly * 100,
                currency: plan.currency ?? "inr",
                recurring: { interval: "month" },     
            });
            updatedData.stripePriceIdMonthly = monthlyPrice.id;
        }
        // yearly price
        if(planData.priceYearly && planData.priceYearly !== plan.priceYearly) {

            const yearlyPrice = await stripe.prices.create({
                product: plan.stripeProductId,
                unit_amount: planData.priceYearly * 100,
                currency: plan.currency ?? "inr",
                recurring: { interval: "year" },     
            });
            updatedData.stripePriceIdYearly = yearlyPrice.id;
        }

        const updated = await this._planRepository.updateOne({ _id: planId}, updatedData);
        if (!updated) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PLAN_NOT_FOUND);
        return mapPlan(updated, true, true);
    }

    async deletePlan(planId: string): Promise<DeleteResult> {
        const deleted = await this._planRepository.deleteOne({ _id: planId });
        if(!deleted) throw createHttpError(HttpStatus.OK, HttpResponse.PLAN_NOT_FOUND);
        return deleted;
    }
}