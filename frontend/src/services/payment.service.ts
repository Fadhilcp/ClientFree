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
}

export const paymentService = new PaymentService();