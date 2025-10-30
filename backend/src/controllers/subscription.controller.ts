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
                throw createHttpError(HttpStatus.BAD_REQUEST, 'Missing required fields');
            }

            const startDate = new Date();
            const expiryDate = new Date(startDate);
            if (billingInterval === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
            else expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            const subscription = await this.service.createSubscription({
                userId,
                planId,
                startDate,
                expiryDate,
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

    async getCurrentPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const  _id  = req.user?._id;

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