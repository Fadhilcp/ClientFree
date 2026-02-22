"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSubscriptionExpiryCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const session_provider_1 = require("../repositories/db/session-provider");
const plan_repository_1 = require("../repositories/plan.repository");
const subscription_repository_1 = require("../repositories/subscription.repository");
const user_repository_1 = require("../repositories/user.repository");
const subscription_service_1 = require("../services/subscription.service");
const subscriptionRepository = new subscription_repository_1.SubscriptionRepository();
const planRepository = new plan_repository_1.PlanRepository();
const userRepository = new user_repository_1.UserRepository();
// transaction session
const sessionProvider = new session_provider_1.MongooseSessionProvider();
const subscriptionService = new subscription_service_1.SubscriptionService(subscriptionRepository, planRepository, userRepository, sessionProvider);
const startSubscriptionExpiryCron = () => {
    node_cron_1.default.schedule("0 0 * * *", async () => {
        try {
            console.log("[CRON] Subscription expiry check started");
            const expiredCount = await subscriptionService.expireSubscriptions();
            console.log(`[CRON] Subscription expiry completed. Expired: ${expiredCount}`);
        }
        catch (error) {
            console.error("[CRON] Subscription expiry failed", error);
        }
    });
};
exports.startSubscriptionExpiryCron = startSubscriptionExpiryCron;
