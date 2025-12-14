import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';
import type { IRazoryOrderResponse } from '../types/razorpay.types';

export class PaymentService {
    fundMilestone(assignmentId: string, milestoneId: string){
        return axios.post(endPoints.PAYMENTS.CREATE_ORDER(assignmentId, milestoneId));
    }

    verifyMilestone(response: IRazoryOrderResponse){
        return axios.post(endPoints.PAYMENTS.VERIFY, response);
    }

    refundMilestone(paymentId: string){
        return axios.post(endPoints.PAYMENTS.REFUND(paymentId));
    }

    releaseMilestone(paymentId: string){
        return axios.post(endPoints.PAYMENTS.RELEASE(paymentId));
    }

    getDisputes(){
        return axios.get(endPoints.PAYMENTS.GET_DISPUTES)
    }

    getDisputeById(paymentId: string){
        return axios.get(endPoints.PAYMENTS.DISPUTE_BY_ID(paymentId));
    }
}

export const paymentService = new PaymentService();