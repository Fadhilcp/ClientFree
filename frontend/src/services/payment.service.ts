import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';

interface IRazoryResponse { 
    razorpay_order_id: string, 
    razorpay_payment_id: string, 
    razorpay_signature: string 
}

export class PaymentService {
    fundMilestone(assignmentId: string, milestoneId: string){
        return axios.post(endPoints.PAYMENTS.CREATE_ORDER(assignmentId, milestoneId));
    }

    verifyMilestone(response: IRazoryResponse){
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