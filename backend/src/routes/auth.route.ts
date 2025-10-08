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
 


authRouter.post('/signUp',authController.signUp.bind(authController));
authRouter.post('/verifySignupOtp',authController.verifySignupOtp.bind(authController));
authRouter.get('/refresh',authController.accessRefreshToken.bind(authController));
authRouter.post('/login',authController.login.bind(authController));
authRouter.post('/forgotPassword',authController.forgotPassword.bind(authController));
authRouter.post('/resendOtp',authController.resendOtp.bind(authController));
authRouter.post('/verifyOtp',authController.verifyOtp.bind(authController));
authRouter.post('/resetPassword',authController.resetPassword.bind(authController));
authRouter.post('/google',authController.googleAuth.bind(authController));
authRouter.get('/verify',authMiddleware,authController.verifyUser.bind(authController));

export default authRouter;