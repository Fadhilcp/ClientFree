import { Router } from "express";

import { AuthService } from "../services/auth.service.js";
import { AuthController } from "../controllers/auth.controller.js";
import { UserRepository } from "../repositories/user.repository.js";
import { PendingUserRepository } from "../repositories/pendingUser.repository.js";

const authRouter = Router()

const userRepository = new UserRepository();
const pendingUserRespository = new PendingUserRepository();
const authService = new AuthService(userRepository, pendingUserRespository);
const authController = new AuthController(authService);
 


authRouter.post('/signUp',authController.signUp.bind(authController))
authRouter.post('/verifyOtp',authController.verifyOtp.bind(authController))
authRouter.post('/login',authController.login.bind(authController))

export default authRouter