import { stripe } from "../config/stripe.config";
import { HttpStatus } from "../constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IStripeWebhookService } from "../services/interface/IStripeWebhookService";
import { createHttpError } from "../utils/httpError.util";
import { env } from "../config/env.config";

export class StripeWebhookController {

    constructor(private _stripeWebhookService: IStripeWebhookService){};

    async handleStripeEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const signature = req.headers["stripe-signature"];

            if(!signature) throw createHttpError(HttpStatus.BAD_REQUEST, "Missing Stripe signature");

            const event = stripe.webhooks.constructEvent(
                req.body, signature, env.STRIPE_WEBHOOK_SECRET!
            );

            if(!event) throw createHttpError(HttpStatus.BAD_REQUEST, "Webhook failed");

            await this._stripeWebhookService.handleStripeEvent(event);

            res.json({ received: true });
        } catch (error) {
            next(error);
        }
    }
}