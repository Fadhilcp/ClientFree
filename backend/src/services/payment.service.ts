import { IPaymentRepository } from "../repositories/interfaces/IPaymentRepository";
import { IPaymentService } from "./interface/IPaymentService";
import { IJobAssignmentRepository } from "../repositories/interfaces/IJobAssignmentRepository";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { ClientSession, FilterQuery, Types } from "mongoose";
import { IJobRepository } from "../repositories/interfaces/IJobRepository";
import { IPaymentDocument } from "../types/payment/payment.type";
import { AdminDisputeMapper } from "../mappers/adminDispute.mapper";
import { AdminDisputeDto, AdminDisputeListDto } from "../dtos/adminDispute.dto";
import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { IWalletTransactionRepository } from "../repositories/interfaces/IWalletTransactionRepository";
import { IDatabaseSessionProvider } from "../repositories/db/session-provider.interface";
import { PaginatedResult } from "../types/pagination";
import { IJobAssignmentDocument } from "../types/jobAssignment/jobAssignment.type";
import { mapAdminWithdrawal } from "../mappers/adminWithdrawal.mapper";
import { AdminWithdrawalDTO } from "../dtos/adminWithdrawal.dto";
import { IWalletTransactionDocument } from "../types/walletTransaction.type";
import { mapPayment } from "../mappers/payment.mapper";
import { mapAdminPayment } from "../mappers/adminPayment.mapper";
import { AdminPaymentDto } from "../dtos/adminPayment.dto";
import { stripe } from "../config/stripe.config";
import { UserRole } from "../constants/user.constants";
import { GetWithdrawalsResponse } from "../dtos/payment.dto";
import { IChatService } from "./interface/IChatService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";

export class PaymentService implements IPaymentService {
    constructor(
        private _paymentRepository: IPaymentRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _jobRepository: IJobRepository,
        
        private _walletRepository: IWalletRepository,
        private _walletTransactionRepository: IWalletTransactionRepository,
        private _sessionProvider: IDatabaseSessionProvider,

        private _chatService: IChatService,
        private _userRepository: IUserRepository
    ){};

    async createMilestoneOrder(assignmentId: string, milestoneId: string, clientId: string): Promise<{
       clientSecret: string;
       payment: IPaymentDocument; 
      }> {

        const assignment = await this._jobAssignmentRepository.findById(assignmentId);
        if(!assignment){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.ASSIGNMENT_NOT_FOUND);
        }

        const milestone = assignment.milestones?.find(m => m._id?.toString() === milestoneId);

        if(!milestone){
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.MILESTONE_NOT_FOUND);
        }
        if (!milestone._id){
          throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Milestone ID missing");
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
            method: "stripe",
            provider: "stripe",
            jobId: assignment.jobId as Types.ObjectId,
            milestoneId: milestone._id,
            freelancerId: assignment.freelancerId,
            clientId,
            userId: clientId
        });

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(milestone.amount * 100),
          currency: "inr",

          automatic_payment_methods: {
            enabled: true,
          },

          metadata: {
            purpose: "milestone",
            paymentId: payment._id.toString(),
            assignmentId: assignment._id.toString(),
            milestoneId: milestone._id.toString(),
            clientId: clientId,
          },
        });

        payment.providerPaymentId = paymentIntent.id;
        await payment.save();

        return {
          clientSecret: paymentIntent.client_secret ?? "",
          payment,
        };
    }

    async refundMilestone(paymentId: string, initiatorId: string, reason?: string)
    : Promise<{ payment: IPaymentDocument }> {

      const payment = await this._paymentRepository.findById(paymentId);

      if (!payment) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.PAYMENT_NOT_FOUND);

      if (payment.status === "refunded") return { payment };
      if (payment.status !== "completed") {
        throw createHttpError(HttpStatus.BAD_REQUEST, "Only completed payments can be refunded");
      }
      // transaction session
      const updatedPayment = await this._sessionProvider.runInTransaction(async (session) => {
        
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
          throw createHttpError(HttpStatus.BAD_REQUEST, "Escrow balance insufficient for refund");
        }

        clientWallet.balance.escrow -= payment.amount;
        await clientWallet.save({ session });

        await this._walletTransactionRepository.createWithSession({
          walletId: clientWallet._id,
          userId: clientWallet.userId,
          jobAssignmentId: assignment._id,
          milestoneId: milestone._id,
          paymentId: payment._id,
          type: "refund",
          direction: "debit",
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
        
        milestone.status = "refund_processing";
        milestone.updatedAt = new Date();

        await assignment.save({ session });

        return payment;
      });
      // stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: payment.providerPaymentId,
        reason: reason ? "requested_by_customer" : undefined,
      })
      // updating payment and milestone after completing stripe refund
      updatedPayment.status = "refunded";
      updatedPayment.referenceId = refund.id;
      updatedPayment.refundDate = new Date();

      await updatedPayment.save();
      
      await this._jobAssignmentRepository.updateOne(
        { "milestones._id": payment.milestoneId },
        {
          $set: {
            "milestones.$.status": "refunded",
            "milestones.$.updatedAt": new Date(),
          }
        }
      );

      return { payment: updatedPayment}
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

      if (milestone.status === "released" || milestone.status === "refund_processing") {
        throw createHttpError(HttpStatus.BAD_REQUEST, "Milestone already released");
      }

      const amount = milestone.amount;
      // to know job completed or not 
      let jobJustCompleted = false;

      // transactional section
      const result = await this._sessionProvider.runInTransaction(async (session: ClientSession) => {

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
          throw createHttpError(HttpStatus.BAD_REQUEST, "Insufficient escrow balance");
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

        payment.status = "released";
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

      if (jobJustCompleted) {
          await this._chatService.updateBlockStatusByJobId(
              assignment.jobId.toString()
          );
      }

      return result;
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

        return AdminDisputeMapper.map(dispute);
    }

    async getAllPayments(search: string, page: number, limit: number): Promise<PaginatedResult<AdminPaymentDto>> {

        const query: FilterQuery<IPaymentDocument> = {
          isDeleted: false,
        };

        if (search) {
          query.$or = [
            { providerPaymentId: { $regex: search, $options: "i" } },
            { providerOrderId: { $regex: search, $options: "i" } },
            { referenceId: { $regex: search, $options: "i" } },
          ];
        }

        const result = await this._paymentRepository.paginate(query, {
           page, limit, sort: { createdAt: -1 }, populate: {
            path: "userId",
            select: "name email role"
          }}
        );

        return {
          ...result,
          data: result.data.map(mapAdminPayment)
        }
    }

    async getAllWithdrawals(search: string, page: number, limit: number): Promise<PaginatedResult<AdminWithdrawalDTO>> {

      const filter: FilterQuery<IPaymentDocument> = {
        type: "withdrawal",
        isDeleted: false,
      };

      if (search) {
        filter.$or = [
          { referenceId: { $regex: search, $options: "i" } },
          { providerPaymentId: { $regex: search, $options: "i" } },
        ];
      }

      const result = await this._paymentRepository.paginate(filter, {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: {
          path: "userId",
          select: "name email role"
        }
      });

      return {
        ...result,
        data: result.data.map(mapAdminWithdrawal)
      }
    }

    async withdraw(userId: string, role: UserRole, amount: number): Promise<{ paymentId: string }> {

      if (!amount || amount <= 0) {
          throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid withdrawal amount");
      }

      if (!["freelancer", "client"].includes(role)) {
        throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid role");
      }

      return this._sessionProvider.runInTransaction(
          async (session: ClientSession) => {

              const wallet = await this._walletRepository.findOneWithSession(
                  { userId, role, status: "active" },
                  session
              );

              if (!wallet) {
                  throw createHttpError(HttpStatus.BAD_REQUEST, "Wallet not found");
              }

              if (wallet.balance.available < amount) {
                  throw createHttpError(HttpStatus.BAD_REQUEST, "Insufficient balance");
              }

              const payment = await this._paymentRepository.createWithSession(
                  {
                      type: "withdrawal",
                      status: "pending",
                      amount,
                      currency: wallet.currency ?? "INR",
                      userId: wallet.userId,
                      method: "wallet",
                      provider: "internal",
                      paymentDate: new Date(),
                      withdrawalDate: new Date(),
                  },
                  session
              );
              // generate reference after _id exists
              payment.referenceId = `WD-${payment._id.toString().slice(-8).toUpperCase()}`;
              await payment.save({ session });

              wallet.balance.available -= amount;
              wallet.balance.pending += amount;
              wallet.updatedAt = new Date();
              await wallet.save({ session });

              await this._walletTransactionRepository.createWithSession(
                  {
                      walletId: wallet._id,
                      userId: wallet.userId,
                      paymentId: payment._id,
                      type: "withdrawal",
                      direction: "debit",
                      amount,
                      status: "pending",
                      balanceAfter: {
                          available: wallet.balance.available,
                          escrow: wallet.balance.escrow,
                          pending: wallet.balance.pending
                      }
                  },
                  session
              );
              return { paymentId: payment._id.toString() };
          }
      );
    }

    async getWithdrawals(userId: string, page: number, limit: number): Promise<GetWithdrawalsResponse> {
        const wallet = await this._walletRepository.findOne({ userId });

        if(!wallet) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.WALLET_NOT_FOUND);

        const filter: FilterQuery<IWalletTransactionDocument> = {
            userId,
            type: "withdrawal",
            isDeleted: false,
        };

        const result = await this._paymentRepository.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 },
        });

        return {
            balances: {
                available: wallet.balance.available,
                escrow: wallet.balance.escrow,
                pending: wallet.balance.pending,
                currency: wallet.currency
            },

            withdrawableAmount: wallet.balance.available,

            withdrawals: result.data.map(mapPayment),

            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        };
    }
}