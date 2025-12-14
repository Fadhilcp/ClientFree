import { IPaymentRepository } from "repositories/interfaces/IPaymentRepository";
import { IPaymentService } from "./interface/IPaymentService";
import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { Types } from "mongoose";
import { getRazorpayInstance } from "config/razorpay.config";
import crypto from 'crypto'
import { env } from "config/env.config";
import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IPaymentDocument } from "types/payment.type";
import { AdminDisputeMapper } from "mappers/adminDispute.mapper";
import { AdminDisputeDto, AdminDisputeListDto } from "dtos/adminDispute.dto";

export class PaymentService implements IPaymentService {
    constructor(
        private _paymentRepository: IPaymentRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _jobRepository: IJobRepository,
    ){};

    async createMilestoneOrder(assignmentId: string, milestoneId: string, clientId: string): Promise<any> {
        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.ASSIGNMENT_NOT_FOUND);
        }

        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);
        if(!milestone){
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        }
        if(milestone.status !== "draft"){
            throw createHttpError(HttpStatus.BAD_REQUEST, "Only draft milestones can be funded");
        }

        if(!milestone.amount || milestone.amount <= 0){
            throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone amount invalid");
        }

        const payment = await this._paymentRepository.create({
            type: "milestone",
            status: "pending",
            amount: milestone.amount,
            currency: "INR",
            method: "razorpay",
            provider: "razorpay",
            jobId: assignment.jobId as Types.ObjectId,
            milestoneId: milestone._id,
            freelancerId: assignment.freelancerId,
            clientId: clientId,
            userId: clientId
        });

        const razorpay = getRazorpayInstance();

        const order = await razorpay.orders.create({
            amount: Math.round(milestone.amount * 100),
            currency: 'INR',
            receipt:  `milestone_${milestone._id}`,
            notes: {
                paymentId: payment._id.toString(),
                assignmentId: assignment._id.toString(),
            },
        });

        payment.providerOrderId = order.id;
        await payment.save();

        return { order, payment };
    }

    async verifyMilestonePayment(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, clientId: string): Promise<any> {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw createHttpError(400, "Invalid payment verification payload");
        }
        const payment = await this._paymentRepository.findOne({ providerOrderId: razorpay_order_id });
        if(!payment) throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid payment verification payload");
        //verify signature
        const signString = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expected = crypto.createHmac("sha256", env.RAZORPAY_SECRET as string)
        .update(signString)
        .digest('hex');

        if(expected !== razorpay_signature){
            throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid signature");
        }

        payment.providerOrderId = razorpay_payment_id;
        payment.providerSignature = razorpay_signature;
        payment.status = "completed";
        payment.paymentDate = new Date();
        await payment.save();

        const assignment = await this._jobAssignmentRepository.findOne({
            "milestones._id": payment.milestoneId
        });
        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND, "Assignment for milestone not found");
        const milestone = assignment.milestones?.find(m => m._id?.toString() === payment.milestoneId?.toString());
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);

        if(milestone.status === "funded" || milestone.status === "released"){
            return { payment, assignment };
        }

        milestone.status = "funded";
        milestone.paymentId = payment._id;
        milestone.updatedAt = new Date();

        await assignment.save();
        return { payment, assignment };
    }

    async refundMilestone(paymentId: string, initiatorId: string, reason?: string): Promise<any> {
        const payment = await this._paymentRepository.findById(paymentId);
        if(!payment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PAYMENT_NOT_FOUND);
        if(payment.status !== "completed" && payment.status !== "processing") {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Only completed/processing payments can be refunded");
        }
        const assignment = await this._jobAssignmentRepository.findOne({ "milestones._id": payment.milestoneId });
        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND,HttpResponse.ASSIGNMENT_NOT_FOUND);
        const milestone = assignment.milestones?.find(m => m._id?.toString() === payment.milestoneId);
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        if(milestone.status === "released"){
            throw createHttpError(HttpStatus.BAD_REQUEST, "Cannot refunded released milestone");
        }
        if(!payment.providerOrderId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "No provider payment id found to refund");
        }
        const razorpay = getRazorpayInstance();
        const refund = await razorpay.payments.refund(payment.providerOrderId, {
            amount: Math.round(payment.amount * 100),
            notes: {
                reason: reason ?? "milestone_refund",
                paymentId: payment._id.toString(),
            }
        });

        payment.status = "refunded";
        payment.refundReason = reason;
        payment.refundDate = new Date();
        await payment.save();

        milestone.status = "refunded";
        milestone.updatedAt = new Date();

        await assignment.save();

        return { payment, refund, assignment };
    }

    async releaseMilestone(paymentId: string, approverId: string): Promise<any> {

        const payment = await this._paymentRepository.findById(paymentId);
        if(!payment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PAYMENT_NOT_FOUND);
        if(payment.status !== "completed"){
            throw createHttpError(HttpStatus.BAD_REQUEST, "Only completed payments can be released");
        }
        const assignment = await this._jobAssignmentRepository.findOne({ "milestones._id": payment.milestoneId });

        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ASSIGNMENT_NOT_FOUND);
        const milestone = assignment.milestones?.find(m => m._id?.toString() === payment.milestoneId?.toString());
        if(!milestone) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        if(milestone.status === "released"){
            throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone already released");
        }
        milestone.status = "released";
        milestone.updatedAt = new Date();

        payment.status = "completed";
        payment.escrowReleaseDate = new Date();

        await payment.save();
        // check if assignment is now completed
        const allReleased = assignment.milestones?.every(
            m => m.status === "released" || m.status === "refunded"
        );

        if(allReleased) {
            assignment.status = "completed";
            assignment.updatedAt = new Date();
        }
        await assignment.save();
        // check if job can be marked completed
        if(allReleased) {
            const assignments = await this._jobAssignmentRepository.find({ jobId: assignment.jobId });
            // check every assignment is completed or not
            const jobAllCompleted = assignments.every(a => a.status === "completed");
            // mark job as completed
            if(jobAllCompleted) {
                const job = await this._jobRepository.findById(assignment.jobId.toString());
                if(job) {
                    job.status = "completed";
                    job.updatedAt = new Date();
                    await job.save();
                }
            }
        }

        return { payment, assignment };
    }

    async listDisputes(): Promise<AdminDisputeListDto[]> {
        const disputes = await this._paymentRepository.findDisputes({ isDisputed: true, status: "disputed" });

        return AdminDisputeMapper.mapList(disputes);
    }

    async getDisputeById(paymentId: string): Promise<AdminDisputeDto> {
        const dispute = await this._paymentRepository.disputeByIdWithDetail(paymentId);

        if(!dispute) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Dispute not found");
        }

        return AdminDisputeMapper.map(dispute)
    }
}