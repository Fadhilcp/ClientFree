import cron from "node-cron";

import { MongooseSessionProvider } from "../repositories/db/session-provider";
import { PlanRepository } from "../repositories/plan.repository";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { UserRepository } from "../repositories/user.repository";

import { SubscriptionService } from "../services/subscription.service";

const subscriptionRepository = new SubscriptionRepository();
const planRepository = new PlanRepository();
const userRepository = new UserRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider();

const subscriptionService = new SubscriptionService(
    subscriptionRepository, 
    planRepository, 
    userRepository,
    sessionProvider
);

export const startSubscriptionExpiryCron = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            console.log("[CRON] Subscription expiry check started");

            const expiredCount = await subscriptionService.expireSubscriptions();

            console.log(
                `[CRON] Subscription expiry completed. Expired: ${expiredCount}`
            );
        } catch (error) {
            console.error("[CRON] Subscription expiry failed", error);
        }
    })
}