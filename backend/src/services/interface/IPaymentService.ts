import { AdminDisputeDto, AdminDisputeListDto } from "dtos/adminDispute.dto";
import { PaginatedResult } from "types/pagination";
export interface IPaymentService {
    createMilestoneOrder(assignmentId: string, milestoneId: string, clientId: string): Promise<any>;
    verifyMilestonePayment(
        razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, clientId: string
    ): Promise<any>;
    refundMilestone(paymentId: string, initiatorId: string, reason?: string): Promise<any>;
    releaseMilestone(paymentId: string, approverId: string): Promise<any>;
    listDisputes(search: string, page: number, limit: number): Promise<PaginatedResult<AdminDisputeListDto>>;
    getDisputeById(paymentId: string): Promise<AdminDisputeDto>;
}