import { endPoints } from '../config/endpoints';
import axios from '../lib/axios';

interface IData{ 
    userId: string, 
    email: string, 
    contact: string, 
    planId: string, 
    billingInterval: 'monthly' | 'yearly' 
}

interface IRazoryResponse { 
    razorpay_subscription_id: string, 
    razorpay_payment_id: string, 
    razorpay_signature: string 
}

class SubscriptionService {

    getAll(search: string, status:string, page:number, limit: number){
        return axios.get(endPoints.SUBSCRIPTION.GET_LIST(search, status, page, limit));
    }

    create(data: IData){
        return axios.post(endPoints.SUBSCRIPTION.CREATE, data);
    }

    verify(response: IRazoryResponse){
        return axios.post(endPoints.SUBSCRIPTION.VERIFY, response);
    }

    cancelSubscription(){
        return axios.patch(endPoints.SUBSCRIPTION.CANCEL);
    }
    
    current(){
        return axios.get(endPoints.SUBSCRIPTION.CURRENT);
    }

    getMySubscription(){
        return axios.get(endPoints.SUBSCRIPTION.ACTIVE_ME);
    }

    getMyHistory(page: number, limit: number){
        return axios.get(endPoints.SUBSCRIPTION.GET_HISTORY(page, limit));
    }
}

export const subscriptionService = new SubscriptionService();