export interface IPaymentService {
    createMilestoneOrder(assignmentId: string, milestoneId: string, clientId: string): Promise<any>;
    verifyMilestonePayment(
        razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, clientId: string
    ): Promise<any>;
    refundMilestone(paymentId: string, initiatorId: string, reason?: string): Promise<any>;
    releaseMilestone(paymentId: string, approverId: string): Promise<any>;
}