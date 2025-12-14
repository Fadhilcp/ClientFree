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
            
            const disputes = await this._paymentService.listDisputes();
            console.log("🚀 ~ PaymentController ~ getAllDisputes ~ disputes:", disputes)

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
}