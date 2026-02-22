"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const plan_mapper_1 = require("../mappers/plan.mapper");
const stripe_config_1 = require("../config/stripe.config");
class PlanService {
    constructor(_planRepository) {
        this._planRepository = _planRepository;
    }
    async getActive(userType) {
        const filter = userType ? { userType, active: true } : { active: true };
        const plans = await this._planRepository.find(filter);
        if (!plans.length) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.NO_PLANS);
        }
        return plans.map(plan => (0, plan_mapper_1.mapPlan)(plan, true, false));
    }
    async getPlans(search, status, page, limit) {
        const filter = {};
        if (status && status !== 'All') {
            filter.active = status === 'Active';
        }
        if (search) {
            filter.$or = [
                { planName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const result = await this._planRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(plan => (0, plan_mapper_1.mapPlan)(plan, false))
        };
    }
    async getPlanById(planId, role) {
        const plan = await this._planRepository.findById(planId);
        if (!plan)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.PLAN_NOT_FOUND);
        return (0, plan_mapper_1.mapPlan)(plan, true, role === 'admin');
    }
    async createPlan(planData) {
        const existingPlan = await this._planRepository.findOne({ planName: planData.planName });
        if (existingPlan) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, `Plan "${planData.planName}" already exists`);
        }
        const product = await stripe_config_1.stripe.products.create({
            name: planData.planName,
            metadata: {
                userType: planData.userType,
            },
        });
        const monthlyPrice = await stripe_config_1.stripe.prices.create({
            product: product.id,
            unit_amount: planData.priceMonthly * 100,
            currency: "inr",
            recurring: { interval: "month" },
        });
        const yearlyPrice = await stripe_config_1.stripe.prices.create({
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
    async updatePlan(planId, planData) {
        const plan = await this._planRepository.findById(planId);
        if (!plan)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.PLAN_NOT_FOUND);
        const updatedData = { ...planData };
        if (planData.planName && planData.planName !== plan.planName) {
            await stripe_config_1.stripe.products.update(plan.stripeProductId, {
                name: planData.planName,
            });
        }
        // monthly price
        if (planData.priceMonthly && planData.priceMonthly !== plan.priceMonthly) {
            const monthlyPrice = await stripe_config_1.stripe.prices.create({
                product: plan.stripeProductId,
                unit_amount: planData.priceMonthly * 100,
                currency: plan.currency ?? "inr",
                recurring: { interval: "month" },
            });
            updatedData.stripePriceIdMonthly = monthlyPrice.id;
        }
        // yearly price
        if (planData.priceYearly && planData.priceYearly !== plan.priceYearly) {
            const yearlyPrice = await stripe_config_1.stripe.prices.create({
                product: plan.stripeProductId,
                unit_amount: planData.priceYearly * 100,
                currency: plan.currency ?? "inr",
                recurring: { interval: "year" },
            });
            updatedData.stripePriceIdYearly = yearlyPrice.id;
        }
        const updated = await this._planRepository.updateOne({ _id: planId }, updatedData);
        if (!updated)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.PLAN_NOT_FOUND);
        return (0, plan_mapper_1.mapPlan)(updated, true, true);
    }
    async deletePlan(planId) {
        const deleted = await this._planRepository.deleteOne({ _id: planId });
        if (!deleted)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.OK, responseMessage_constant_1.HttpResponse.PLAN_NOT_FOUND);
        return deleted;
    }
}
exports.PlanService = PlanService;
