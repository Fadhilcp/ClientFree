import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IPaymentService } from "services/interface/IPaymentService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class PaymentController {
    constructor(private _paymentService: IPaymentService){}

    async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { assignmentId, milestoneId } = req.params;
            const clientId = req.user?._id;
            if(!clientId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const result = await this._paymentService.createMilestoneOrder(assignmentId, milestoneId, clientId);
            
            sendResponse(res, HttpStatus.OK, result);
        } catch (error) {
            next(error);
        }
    }

    async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            console.log("🚀 ~ PaymentController ~ verifyPayment ~ razorpay_order_id, razorpay_payment_id, razorpay_signature:", razorpay_order_id, razorpay_payment_id, razorpay_signature)
            const clientId = req.user?._id;

            if(!clientId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const result = await this._paymentService.verifyMilestonePayment(
                razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature,
                clientId
            );

            sendResponse(res, HttpStatus.OK, result);
        } catch (error) {
            next(error);
        }
    }

    async refund(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { paymentId } = req.params;
            const initiatorId = req.user?._id;
            const { reason } = req.body;

            if(!initiatorId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const result = await this._paymentService.refundMilestone(paymentId, initiatorId, reason);

            sendResponse(res, HttpStatus.OK, result);
        } catch (error) {
            next(error);
        }
    }

    async release(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { paymentId } = req.params;
            const clientId = req.user?._id;
            if(!clientId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const result = await this._paymentService.releaseMilestone(paymentId, clientId);

            sendResponse(res, HttpStatus.OK, result);
        } catch (error) {
            next(error);
        }
    }

    async getAllDisputes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const disputes = await this._paymentService.listDisputes(search, page, limit);

            sendResponse(res, HttpStatus.OK, { disputes });
        } catch (error) {
            next(error);
        }
    }

    async getDisputeById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { paymentId } = req.params;

            const dispute = await this._paymentService.getDisputeById(paymentId);

            sendResponse(res, HttpStatus.OK, { dispute });
        } catch (error) {
            next(error);
        }
    }

    async getAllPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const payments = await this._paymentService.getAllPayments(search, page, limit);

            sendResponse(res, HttpStatus.OK, { payments });
        } catch (error) {
            next(error);
        }
    }

    async getAllWithdrawals(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const withdrawals = await this._paymentService.getAllWithdrawals(search, page, limit);
            
            sendResponse(res, HttpStatus.OK, { withdrawals });
        } catch (error) {
            next(error);
        }
    }

    async getWithdrawals(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const userId = req.user?._id;

            if(!userId){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const data = await this._paymentService.getWithdrawals(userId, page, limit);

            sendResponse(res, HttpStatus.OK, data);
        } catch (error) {
            next(error);
        }
    }

    async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const { amount } = req.body;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            await this._paymentService.withdraw(userId, amount);

            sendResponse(res, HttpStatus.OK, {});
        } catch (error) {
            next(error);
        }
    }
}