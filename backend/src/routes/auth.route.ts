import { Router } from "express";

import { AuthService } from "../services/auth.service";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/user.repository";
import { OtpUserStoreRepository } from "../repositories/otpUserStore.repository";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { WalletRepository } from "repositories/wallet.repository";
import { SubscriptionRepository } from "repositories/subscription.repository";
import { PlanRepository } from "repositories/plan.repository";
import { PaymentRepository } from "repositories/payment.repository";
import { RevenueRepository } from "repositories/revenue.repository";
import { MongooseSessionProvider } from "repositories/db/session-provider";
import { SubscriptionService } from "services/subscription.service";

const authRouter = Router()

const userRepository = new UserRepository();
const otpUserRespository = new OtpUserStoreRepository();
const walletRepository = new WalletRepository();

const subscriptionRepository = new SubscriptionRepository();
const planRepository = new PlanRepository();
const paymentRepository = new PaymentRepository();
const revenueRepository = new RevenueRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider();

const subscriptionService = new SubscriptionService(
    subscriptionRepository, 
    planRepository, 
    userRepository, 
    paymentRepository, 
    revenueRepository,
    sessionProvider,
);

const authService = new AuthService(
    userRepository, 
    otpUserRespository,
    walletRepository,
    subscriptionService,
);

const authController = new AuthController(authService);



authRouter.post('/signup',authController.signUp.bind(authController));
authRouter.post('/verify-signup-otp',authController.verifySignupOtp.bind(authController));
authRouter.post('/login',authController.login.bind(authController));
authRouter.post('/resend-otp',authController.resendOtp.bind(authController));
authRouter.post('/verify-otp',authController.verifyOtp.bind(authController));

authRouter.get('/refresh',authController.accessRefreshToken.bind(authController));
authRouter.get('/access',authController.getNewAccessToken.bind(authController));

authRouter.post('/forgot-password',authController.forgotPassword.bind(authController));
authRouter.post('/reset-password',authController.resetPassword.bind(authController));
authRouter.post('/google',authController.googleAuth.bind(authController));
authRouter.post('/logout',authController.logout.bind(authController));

authRouter.put('/change-password',authMiddleware,verifyUserNotBanned,authController.changePassword.bind(authController));

export default authRouter;