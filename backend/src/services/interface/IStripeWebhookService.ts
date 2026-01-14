import Stripe from "stripe";

export interface IStripeWebhookService {
    handleStripeEvent(event: Stripe.Event): Promise<void>;
}