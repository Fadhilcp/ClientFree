import { IPaymentRepository } from "repositories/interfaces/IPaymentRepository";
import { IPaymentService } from "./interface/IPaymentService";
import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { ClientSession, FilterQuery, Types } from "mongoose";
import { getRazorpayInstance } from "config/razorpay.config";
import crypto from 'crypto'
import { env } from "config/env.config";
import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IPaymentDocument } from "types/payment/payment.type";
import { AdminDisputeMapper } from "mappers/adminDispute.mapper";
import { AdminDisputeDto, AdminDisputeListDto } from "dtos/adminDispute.dto";
import { IWalletRepository } from "repositories/interfaces/IWalletRepository";
import { IWalletTransactionRepository } from "repositories/interfaces/IWalletTransactionRepository";
import { IDatabaseSessionProvider } from "repositories/db/session-provider.interface";
import { PaginatedResult } from "types/pagination";
import { Orders } from "razorpay/dist/types/orders";
import { IJobAssignmentDocument } from "types/jobAssignment/jobAssignment.type";

export class PaymentService implements IPaymentService {
    constructor(
        private _paymentRepository: IPaymentRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _jobRepository: IJobRepository,
        
        private _walletRepository: IWalletRepository,
        private _walletTransactionRepository: IWalletTransactionRepository,
        private _sessionProvider: IDatabaseSessionProvider
    ){};

    async createMilestoneOrder(assignmentId: string, milestoneId: string, clientId: string): Promise<{
      order: Orders.RazorpayOrder,
      payment: IPaymentDocument
    }> {
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

    async verifyMilestonePayment(
      razorpay_order_id: string,
      razorpay_payment_id: string,
      razorpay_signature: string,
      clientId: string
    ): Promise<{ payment: IPaymentDocument, assignment?: IJobAssignmentDocument }> {

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw createHttpError(400, "Invalid payment verification payload");
      }

      const payment = await this._paymentRepository.findOne({
        providerOrderId: razorpay_order_id
      });

      if (!payment) {
        throw createHttpError(HttpStatus.BAD_REQUEST, "Payment not found");
      }

      if (payment.status === "completed") {
        return { payment };
      }

      //signature verification
      const signString = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto
        .createHmac("sha256", env.RAZORPAY_SECRET as string)
        .update(signString)
        .digest("hex");

      if (expected !== razorpay_signature) {
        throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid signature");
      }

      // transactional section
      return this._sessionProvider.runInTransaction(async (session: ClientSession) => {

        payment.providerPaymentId = razorpay_payment_id;
        payment.providerSignature = razorpay_signature;
        payment.status = "completed";
        payment.paymentDate = new Date();

        await payment.save({ session });

        const clientWallet = await this._walletRepository.findOneWithSession(
          { userId: clientId, role: "client", status: "active" },
          session
        );

        if (!clientWallet) {
          throw createHttpError(HttpStatus.BAD_REQUEST, "Client wallet not found");
        }

        clientWallet.balance.escrow += payment.amount;
        await clientWallet.save({ session });

        const assignment = await this._jobAssignmentRepository.findOneWithSession(
          { "milestones._id": payment.milestoneId },
          session
        );

        if (!assignment) {
          throw createHttpError(HttpStatus.NOT_FOUND, "Assignment not found");
        }

        const milestone = assignment.milestones?.find(
          m => m._id?.toString() === payment.milestoneId?.toString()
        );

        if (!milestone) {
          throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        }

        if (milestone.status !== "draft") {
          return { payment, assignment };
        }

        await this._walletTransactionRepository.createWithSession({
          walletId: clientWallet._id,
          userId: clientWallet.userId,
          jobAssignmentId: assignment._id,
          milestoneId: milestone._id,
          paymentId: payment._id,
          type: "escrow_hold",
          direction: "credit",
          amount: payment.amount,
          balanceAfter: {
            available: clientWallet.balance.available,
            escrow: clientWallet.balance.escrow,
            pending: clientWallet.balance.pending,
          },
        }, session);


        if(milestone.status === "draft") {
          milestone.status = "funded";
          milestone.paymentId = payment._id;
          milestone.updatedAt = new Date();
          await assignment.save({ session });
        }

        return { payment, assignment };
      });
    }

    async refundMilestone(paymentId: string, initiatorId: string, reason?: string)
    : Promise<{ payment: IPaymentDocument }> {

      const payment = await this._paymentRepository.findById(paymentId);
      if (!payment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PAYMENT_NOT_FOUND);

      if (payment.status === "refunded") return { payment };
      if (payment.status !== "completed") throw createHttpError(
        HttpStatus.BAD_REQUEST,
        "Only completed payments can be refunded"
      );
      // transaction session
      return this._sessionProvider.runInTransaction(async (session) => {

        const assignment = await this._jobAssignmentRepository.findOneWithSession(
          { "milestones._id": payment.milestoneId },
          session
        );

        if(!assignment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ASSIGNMENT_NOT_FOUND);

        const milestone = assignment.milestones?.find(
          m => m._id?.toString() === payment.milestoneId?.toString()
        );

        if (!milestone) {
          throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        }

        if (milestone.status === "released") {
          throw createHttpError(HttpStatus.BAD_REQUEST, "Cannot refund a released milestone");
        }

        const clientWallet = await this._walletRepository.findOneWithSession(
          { userId: payment.clientId, role: "client", status: "active" },
          session
        );

        if (!clientWallet) {
          throw createHttpError(HttpStatus.BAD_REQUEST, "Client wallet not found");
        }

        if (clientWallet.balance.escrow < payment.amount) {
          throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "Escrow balance insufficient for refund"
          );
        }

        clientWallet.balance.escrow -= payment.amount;
        clientWallet.balance.available += payment.amount;

        await clientWallet.save({ session });

        await this._walletTransactionRepository.createWithSession({
          walletId: clientWallet._id,
          userId: clientWallet.userId,
          jobAssignmentId: assignment._id,
          milestoneId: milestone._id,
          paymentId: payment._id,
          type: "refund",
          direction: "credit",
          amount: payment.amount,
          balanceAfter: {
            available: clientWallet.balance.available,
            escrow: clientWallet.balance.escrow,
            pending: clientWallet.balance.pending,
          },
        }, session);

        payment.status = "refund_processing";
        payment.refundReason = reason;
        payment.refundDate = new Date();

        await payment.save({ session });

        milestone.status = "refunded";
        milestone.updatedAt = new Date();

        await assignment.save({ session });

        return { payment };
      });
    }



    async releaseMilestone(paymentId: string)
    : Promise<{ payment: IPaymentDocument, assignment: IJobAssignmentDocument }> {

      const payment = await this._paymentRepository.findById(paymentId);
      if (!payment) {
        throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PAYMENT_NOT_FOUND);
      }

      if (payment.status !== "completed") {
        throw createHttpError(
          HttpStatus.BAD_REQUEST,
          "Only completed payments can be released"
        );
      }

      const assignment = await this._jobAssignmentRepository.findOne({
        "milestones._id": payment.milestoneId
      });

      if (!assignment) {
        throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ASSIGNMENT_NOT_FOUND);
      }

      const milestone = assignment.milestones?.find(
        m => m._id?.toString() === payment.milestoneId?.toString()
      );

      if (!milestone) {
        throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
      }

      if (milestone.status === "released") {
        throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone already released");
      }

      const amount = milestone.amount;

      // transactional section
      return this._sessionProvider.runInTransaction(async (session: ClientSession) => {

        const clientWallet = await this._walletRepository.findOneWithSession(
            { userId: payment.clientId, role: "client", status: "active" }, 
            session
        );

        const freelancerWallet = await this._walletRepository.findOneWithSession(
            { userId: payment.freelancerId, role: "freelancer", status: "active" }, 
            session
        );

        if (!clientWallet || !freelancerWallet) {
          throw createHttpError(HttpStatus.BAD_REQUEST, "Wallet not found");
        }

        if (clientWallet.balance.escrow < amount) {
          throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "Insufficient escrow balance"
          );
        }

        clientWallet.balance.escrow -= amount;
        await clientWallet.save({ session });

        await this._walletTransactionRepository.createWithSession({
          walletId: clientWallet._id,
          userId: clientWallet.userId,
          jobAssignmentId: assignment._id,
          milestoneId: milestone._id,
          paymentId: payment._id,
          type: "escrow_release",
          direction: "debit",
          amount,
          balanceAfter: {
            available: clientWallet.balance.available,
            escrow: clientWallet.balance.escrow,
            pending: clientWallet.balance.pending,
          }
        }, session );

        freelancerWallet.balance.available += amount;
        await freelancerWallet.save({ session });

        await this._walletTransactionRepository.createWithSession({
          walletId: freelancerWallet._id,
          userId: freelancerWallet.userId,
          jobAssignmentId: assignment._id,
          milestoneId: milestone._id,
          paymentId: payment._id,
          type: "escrow_release",
          direction: "credit",
          amount,
          balanceAfter: {
            available: freelancerWallet.balance.available,
            escrow: freelancerWallet.balance.escrow,
            pending: freelancerWallet.balance.pending,
          },
        }, session );

        milestone.status = "released";
        milestone.updatedAt = new Date();

        payment.escrowReleaseDate = new Date();
        await payment.save({ session });

        const allReleased = assignment.milestones?.every(
          m => m.status === "released" || m.status === "refunded"
        );

        if (allReleased) {
          assignment.status = "completed";
          assignment.updatedAt = new Date();
        }

        await assignment.save({ session });

        if (allReleased) {
          const assignments = await this._jobAssignmentRepository.findWithSession(
            { jobId: assignment.jobId }, session
        );

          const jobAllCompleted = assignments.every(
            a => a.status === "completed"
          );

          if (jobAllCompleted) {
            const job = await this._jobRepository.findByIdWithSession(
                assignment.jobId.toString(), session
            );

            if (job) {
              job.status = "completed";
              job.updatedAt = new Date();
              await job.save({ session });
            }
          }
        }
        return { payment, assignment };
      });
    }

    async listDisputes(search: string, page: number, limit: number): Promise<PaginatedResult<AdminDisputeListDto>> {

        const filter: FilterQuery<IPaymentDocument> = {
          isDisputed: true,
        };

        if (search) {
          const or: FilterQuery<IPaymentDocument>[] = [
            { disputeReason: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } },
            { provider: { $regex: search, $options: "i" } },
            { currency: { $regex: search, $options: "i" } },
          ];

          const amount = Number(search);
          if (!Number.isNaN(amount)) {
            or.push({ amount });
          }

          filter.$or = or;
        }

        const result = await this._paymentRepository.paginate(
          filter,
          {
            page,
            limit,
            sort: { createdAt: -1 },
            populate: [
              { path: "clientId", select: "name email" },
              { path: "freelancerId", select: "name email" },
              { path: "userId", select: "name email" },
              { path: "jobId", select: "title" },
            ],
          }
        );

        return {
          ...result,
          data: AdminDisputeMapper.mapList(result.data)
        }
    }

    async getDisputeById(paymentId: string): Promise<AdminDisputeDto> {
        const dispute = await this._paymentRepository.disputeByIdWithDetail(paymentId);

        if(!dispute) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Dispute not found");
        }

        return AdminDisputeMapper.map(dispute)
    }
}