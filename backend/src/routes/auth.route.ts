import { Router } from "express";

import { AuthService } from "../services/auth.service";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/user.repository";
import { OtpUserStoreRepository } from "../repositories/otpUserStore.repository";
import { authMiddleware } from "middlewares/authMiddleware";

const authRouter = Router()

const userRepository = new UserRepository();
const otpUserRespository = new OtpUserStoreRepository();
const authService = new AuthService(userRepository, otpUserRespository);
const authController = new AuthController(authService);



authRouter.post('/signup',authController.signUp.bind(authController));
authRouter.post('/verify-signup-otp',authController.verifySignupOtp.bind(authController));
authRouter.get('/refresh',authController.accessRefreshToken.bind(authController));
authRouter.post('/login',authController.login.bind(authController));
authRouter.post('/resend-otp',authController.resendOtp.bind(authController));
authRouter.post('/verify-otp',authController.verifyOtp.bind(authController));
authRouter.get('/access',authController.getNewAccessToken.bind(authController));

authRouter.post('/forgot-password',authController.forgotPassword.bind(authController));
authRouter.post('/reset-password',authController.resetPassword.bind(authController));
authRouter.put('/change-password',authMiddleware,authController.changePassword.bind(authController));

authRouter.post('/google',authController.googleAuth.bind(authController));

export default authRouter;