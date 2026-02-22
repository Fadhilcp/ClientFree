"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const stripe_config_1 = require("../config/stripe.config");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const env_config_1 = require("../config/env.config");
class StripeWebhookController {
    constructor(_stripeWebhookService) {
        this._stripeWebhookService = _stripeWebhookService;
    }
    ;
    async handleStripeEvent(req, res, next) {
        try {
            const signature = req.headers["stripe-signature"];
            if (!signature)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Missing Stripe signature");
            const event = stripe_config_1.stripe.webhooks.constructEvent(req.body, signature, env_config_1.env.STRIPE_WEBHOOK_SECRET);
            if (!event)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Webhook failed");
            await this._stripeWebhookService.handleStripeEvent(event);
            res.json({ received: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StripeWebhookController = StripeWebhookController;
