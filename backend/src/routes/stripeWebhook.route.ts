import { StripeWebhookController } from "../controllers/stripeWebhook.controller";
import { Router, raw } from "express";
import { MongooseSessionProvider } from "../repositories/db/session-provider";
import { JobAssignmentRepository } from "../repositories/jobAssignment.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { PlanRepository } from "../repositories/plan.repository";
import { RevenueRepository } from "../repositories/revenue.repository";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { UserRepository } from "../repositories/user.repository";
import { WalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionRepository } from "../repositories/walletTransaction.repository";
import { StripeWebhookService } from "../services/stripeWebhook.service";

const stripeWebhookRouter = Router();

const subscriptionRepository = new SubscriptionRepository();
const planRepository = new PlanRepository();
const userRepository = new UserRepository();
const paymentRepository = new PaymentRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const walletRepository = new WalletRepository();
const walletTransactionRepository = new WalletTransactionRepository();
const revenueRepository = new RevenueRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider();

const stripeWebhookService = new StripeWebhookService(
    subscriptionRepository,
    planRepository,
    userRepository,
    paymentRepository,
    jobAssignmentRepository,
    walletRepository,
    walletTransactionRepository,
    revenueRepository,
    sessionProvider,
);

const stripeWebhookController = new StripeWebhookController(stripeWebhookService);

stripeWebhookRouter.post("/stripe",raw({ type: "application/json" }),stripeWebhookController.handleStripeEvent.bind(stripeWebhookController));

export default stripeWebhookRouter;