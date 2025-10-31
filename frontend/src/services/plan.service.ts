import { endPoints } from '../config/endpoints'
import axios from '../lib/axios'

interface IPlan {
  userType: "client" | "freelancer";
  planName: string;
  planCode: "FREE" | "BASIC" | "PRO" | string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: Record<string, boolean | number>;
  active: boolean;
}

class PlanService {
    getPlans(){
        return axios.get(endPoints.PLAN.LIST);
    }

    getPlan(planId: string){
        return axios.get(endPoints.PLAN.BY_ID(planId));
    }

    createPlan(data: IPlan){
        return axios.post(endPoints.PLAN.CREATE, data);
    }

    updatePlan(planId: string, data: Partial<IPlan>){
        return axios.put(endPoints.PLAN.BY_ID(planId), data);
    }

    deletePlan(planId: string){
        return axios.delete(endPoints.PLAN.BY_ID(planId));
    }
}

export const planService = new PlanService();