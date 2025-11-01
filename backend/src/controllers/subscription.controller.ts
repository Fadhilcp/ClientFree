import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { ISubscriptionService } from "services/interface/ISubscriptionService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";


//need to test all 
export class SubscriptionController {
    constructor(private service: ISubscriptionService){}

    async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, email, contact, planId, billingInterval } = req.body;

            if (!userId || !planId || !billingInterval) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.MISSING_REQUIRED_FIELDS);
            }

            const subscription = await this.service.createSubscription({
                userId,
                planId,
                billingInterval,
                gateway: 'razorpay',
                status: 'active',
                autoRenew: true,
                email,
                contact,
            });
            sendResponse(res, HttpStatus.CREATED, { subscription });
        } catch (error) {
            next(error);
        }
    }

    async verifySubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = req.body;
            const role = req.user?.role;

            if(!role) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.UNAUTHORIZED);
            if (!["client", "freelancer"].includes(role)) {
                throw createHttpError(HttpStatus.FORBIDDEN, "Invalid user role");
            }
            
            if (!razorpay_subscription_id || !razorpay_payment_id) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.MISSING_REQUIRED_FIELDS)
            }

            const result = await this.service.verifyPayment({
                razorpay_subscription_id,
                razorpay_payment_id,
                razorpay_signature,
                role
            });
            sendResponse(res, HttpStatus.OK, {}, result?.message );
        } catch (error) {
            next(error);
        }
    }

    async cancelSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { subscriptionId, userId } = req.body;
            // const userId = req.user?._id;

            if(!userId) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.USER_NOT_FOUND);

            const result = await this.service.cancelSubscription(userId, subscriptionId);

            sendResponse(res, HttpStatus.OK, {}, result.message);
        } catch (error) {
            next(error);
        }
    }

    async getCurrentPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const _id  = req.user?._id;

            if (!_id) {
                throw createHttpError(HttpStatus.BAD_REQUEST, 'User ID is required');
            }

            const plan = await this.service.getCurrentPlan(_id);
            sendResponse(res, HttpStatus.OK, { plan });
        } catch (error) {
            next(error);
        }
    }
}