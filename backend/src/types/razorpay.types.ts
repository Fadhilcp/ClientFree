export interface IRazoryPaymentResponse {
    paymentRecordId?: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}
