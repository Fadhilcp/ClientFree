import Razorpay from "razorpay";
import { env } from "./env.config";

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
    if(!razorpayInstance){
        razorpayInstance = new Razorpay({
            key_id: env.RAZORPAY_KEY_ID,
            key_secret: env.RAZORPAY_SECRET
        })
    }
    return razorpayInstance;
}