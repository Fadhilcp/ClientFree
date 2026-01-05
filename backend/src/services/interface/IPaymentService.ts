import { AdminDisputeDto, AdminDisputeListDto } from "../../dtos/adminDispute.dto";
import { AdminPaymentDto } from "../../dtos/adminPayment.dto";
import { AdminWithdrawalDTO } from "../../dtos/adminWithdrawal.dto";
import { Orders } from "razorpay/dist/types/orders";
import { IJobAssignmentDocument } from "../../types/jobAssignment/jobAssignment.type";
import { PaginatedResult } from "../../types/pagination";
import { IPaymentDocument } from "../../types/payment/payment.type";
export interface IPaymentService {
    createMilestoneOrder(assignmentId: string, milestoneId: string, clientId: string): Promise<{
          order: Orders.RazorpayOrder,
          payment: IPaymentDocument
        }>;
    verifyMilestonePayment(
        razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, clientId: string
    ): Promise<{ payment: IPaymentDocument, assignment?: IJobAssignmentDocument }>;
    refundMilestone(paymentId: string, initiatorId: string, reason?: string): Promise<{ payment: IPaymentDocument }>;
    releaseMilestone(paymentId: string, approverId: string): Promise<{ payment: IPaymentDocument, assignment: IJobAssignmentDocument }>;
    listDisputes(search: string, page: number, limit: number): Promise<PaginatedResult<AdminDisputeListDto>>;
    getDisputeById(paymentId: string): Promise<AdminDisputeDto>;
    getAllPayments(search: string, page: number, limit: number): Promise<PaginatedResult<AdminPaymentDto>>;
    getAllWithdrawals(search: string, page: number, limit: number): Promise<PaginatedResult<AdminWithdrawalDTO>>; 
    withdraw(userId: string, amount: number): Promise<void>;
    getWithdrawals(userId: string, page: number, limit: number): Promise<any>;
}