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

    refundMilestone(paymentId: string, reason: { reason: string }){
        return axios.post(endPoints.PAYMENTS.REFUND(paymentId), reason);
    }

    releaseMilestone(paymentId: string){
        return axios.post(endPoints.PAYMENTS.RELEASE(paymentId));
    }

    getDisputes(search: string, page: number, limit: number){
        return axios.get(endPoints.PAYMENTS.GET_DISPUTES(search, page, limit))
    }

    getDisputeById(paymentId: string){
        return axios.get(endPoints.PAYMENTS.DISPUTE_BY_ID(paymentId));
    }

    getWithdrawals(page: number, limit: number){
        return axios.get(endPoints.PAYMENTS.GET_WITHDRAWALS(page, limit))
    }

    withdrawAmount(amount: number){
        return axios.post(endPoints.PAYMENTS.WITHDRAW, { amount });
    }

    getAllPayments(search: string, page: number, limit: number){
        return axios.get(endPoints.PAYMENTS.GET_ALL(search, page, limit));
    }

    getAdminWithdrawals(search: string, page: number, limit: number){
        return axios.get(endPoints.PAYMENTS.GET_ADMIN_WITHDRAWALS(search, page, limit));
    }
}

export const paymentService = new PaymentService();