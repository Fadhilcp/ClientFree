import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../services/interface/IAuthService";
import { setCookie } from "../utils/refreshCookie.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { createHttpError } from "../utils/httpError.util";
import { AuthPayload } from "types/auth.type";
import { sendResponse } from "utils/response.util";


export class AuthController {
    constructor(private service : IAuthService){}

    async signUp(req : Request, res : Response, next : NextFunction) : Promise<void>{
        try {
            const { username, email , password, role } = req.body;

            await this.service.signUp({ username, email, password, role} as any);

            sendResponse(res, HttpStatus.CREATED, {
                email
            },'OTP sent to your email. Please verify to complete signup')
        } catch (error : any) {
            next(error)
        }
    };

    async verifySignupOtp(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, otp, purpose } = req.body;
            console.log(email,otp)

            const { user, accessToken, refreshToken } = await this.service.verifySignupOtp(email, otp, purpose);

            setCookie(res, refreshToken);

            sendResponse(res, HttpStatus.OK, {
                token: accessToken,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            }, "SignUp complete");
        } catch (error : any) {
            next(error)
        }
    };

    async login(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, password } = req.body;

            const { user, accessToken, refreshToken } = await this.service.login(email, password);
            
            setCookie(res, refreshToken);
            
            sendResponse(res, HttpStatus.OK, {
                token: accessToken,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            }, "Login complete");
        } catch (error : any) {
            next(error)
        }
    };

    async forgotPassword(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {

            const { email } = req.body;
            console.log("🚀 ~ AuthController ~ forgotPassword ~ email:", email)

            if(!email || typeof email !== 'string') {
             throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.INVALID_EMAIL)
            }

            console.log('auth controller - forgotpassword --')

            await this.service.forgotPassword(email);

            sendResponse(res, HttpStatus.OK, {}, "OTP sent to your email");
            
        } catch (error : any) {
            next(error)
        }
    }

    async resendOtp(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, purpose } = req.body;

            if(!email){
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.INVALID_EMAIL);
            }

            if(!['signup','forgot-password','email-change', 'phone-change'].includes(purpose)){
                throw createHttpError(HttpStatus.BAD_REQUEST, 'Invalid OTP purpose')
            }

            await this.service.resendOtp(email, purpose);

            sendResponse(res, HttpStatus.OK, {},
                HttpResponse.OTP_RESENT_SUCCESS,
            );
        } catch (error : any) {
            next(error)
        }
    }

    async verifyOtp(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, otp, purpose } = req.body;
            console.log("🚀 ~ AuthController ~ verifyOtp ~ purpose:", purpose)
            console.log("🚀 ~ AuthController ~ verifyOtp ~ otp:", otp)
            console.log("🚀 ~ AuthController ~ verifyOtp ~ email:", email)

            if (!email || !otp || !purpose) {
               throw createHttpError(HttpStatus.BAD_REQUEST, 'Email, OTP, and purpose are required');
            }
        
            await this.service.verifyOtp(email, otp, purpose);

            sendResponse(res, HttpStatus.OK, {},
                HttpResponse.OTP_VERIFIED_SUCCESS,
            );
            
        } catch (error : any) {
            next(error)
        }
    }

    async resetPassword(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {

            const { email , password } = req.body;

            if (!email || !password) {
               throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.EMAIL_AND_PASSWORD_REQUIRED);
            }

            await this.service.resetPassword(email, password);

            sendResponse(res, HttpStatus.OK, {},
                HttpResponse.PASSWORD_CHANGE_SUCCESS,
            );
            
        } catch (error : any) {
            next(error)
        }
    }

    async accessRefreshToken(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;
            console.log("🚀 ~ AuthController ~ accessRefreshToken ~ refreshToken:", refreshToken)

            const { accessToken, newRefreshToken } = await this.service.accessRefreshToken(refreshToken);

            setCookie(res, newRefreshToken);

            sendResponse(res, HttpStatus.OK, {
                token: accessToken 
            }, "Access token generated successfully");
                
        } catch (error : any) {
            next(error)
        }
    }

    async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { token, role } = req.body;

            if(!token) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.NO_TOKEN);
            }

            const result = await this.service.googleAuth(token, role);

             if(result.needsRole){

                sendResponse(res, HttpStatus.OK, {
                    needsRole: result.needsRole
                }, "New user needs to select role");

                return;
             }

            if(result.refreshToken) setCookie(res, result.refreshToken);

            sendResponse(res, HttpStatus.OK, {
                    user: result.user,
                    token: result.accessToken,
                    isNewUser: result.isNewUser,
            }, "Google authentication successful");
            
        } catch (error) {
            next(error);
        }
    }

    async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
             const userPayload = req.user as AuthPayload | undefined;
             console.log("🚀 ~ AuthController ~ verifyUser ~ userPayload:", userPayload)

            if (!userPayload?._id) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.USER_NOT_FOUND);
            }

            const { user } = await this.service.verifyUser(userPayload._id);
            console.log("🚀 ~ AuthController ~ verifyUser ~ user:", user)
            if (!user) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            }

        // setCookie(res, refreshToken);

            sendResponse(res, HttpStatus.OK, {
                    user,
                    token: req.headers.authorization?.split(" ")[1] || null,
            }, "Token verified successfully");
        } catch (error) {
            next(error);
        }
    }
};