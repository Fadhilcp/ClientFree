import Stripe from "stripe";
import { env } from './env.config';

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY not set");
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover"
});