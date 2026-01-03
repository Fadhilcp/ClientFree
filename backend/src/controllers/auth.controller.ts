import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../services/interface/IAuthService";
import { clearCookie, setCookie } from "../utils/refreshCookie.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { createHttpError } from "../utils/httpError.util";
import { sendResponse } from "utils/response.util";


export class AuthController {
    constructor(private _authService : IAuthService){}

    async signUp(req : Request, res : Response, next : NextFunction) : Promise<void>{
        try {
            const { username, email , password, role } = req.body;

            await this._authService.signUp({ username, email, password, role});

            sendResponse(res, HttpStatus.CREATED, {
                email
            },'OTP sent to your email. Please verify to complete signup')
        } catch (error) {
            next(error)
        }
    };

    async verifySignupOtp(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, otp, purpose } = req.body;
            console.log(email,otp)

            const { user, accessToken, refreshToken } = await this._authService.verifySignupOtp(email, otp, purpose);

            setCookie(res, refreshToken);

            sendResponse(res, HttpStatus.OK, {
                token: accessToken,
                user
            }, "SignUp complete");
        } catch (error) {
            next(error)
        }
    };

    async login(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, password } = req.body;

            const { user, accessToken, refreshToken, subscription } = await this._authService.login(email, password);
            
            setCookie(res, refreshToken);
            
            sendResponse(res, HttpStatus.OK, {
                token: accessToken,
                user,
                subscription
            }, "Login complete");
        } catch (error) {
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

            await this._authService.forgotPassword(email);

            sendResponse(res, HttpStatus.OK, {}, "OTP sent to your email");
            
        } catch (error) {
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

            await this._authService.resendOtp(email, purpose);

            sendResponse(res, HttpStatus.OK, {},
                HttpResponse.OTP_RESENT_SUCCESS,
            );
        } catch (error) {
            next(error)
        }
    }

    async verifyOtp(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, otp, purpose } = req.body;
            console.log("🚀 ~ AuthController ~ verifyOtp ~ otp:", otp);

            if (!email || !otp || !purpose) {
               throw createHttpError(HttpStatus.BAD_REQUEST, 'Email, OTP, and purpose are required');
            }
        
            await this._authService.verifyOtp(email, otp, purpose);

            sendResponse(res, HttpStatus.OK, {},
                HttpResponse.OTP_VERIFIED_SUCCESS,
            );
            
        } catch (error) {
            next(error)
        }
    }

    async resetPassword(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {

            const { email , password } = req.body;

            if (!email || !password) {
               throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.EMAIL_AND_PASSWORD_REQUIRED);
            }

            await this._authService.resetPassword(email, password);

            sendResponse(res, HttpStatus.OK, {},
                HttpResponse.PASSWORD_CHANGE_SUCCESS,
            );
            
        } catch (error) {
            next(error)
        }
    }

    async accessRefreshToken(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;
            console.log("🚀 ~ AuthController ~ accessRefreshToken ~ refreshToken:", refreshToken)

            const { accessToken, newRefreshToken } = await this._authService.accessRefreshToken(refreshToken);

            setCookie(res, newRefreshToken);

            sendResponse(res, HttpStatus.OK, {
                token: accessToken 
            }, "Access token generated successfully");
                
        } catch (error) {
            next(error)
        }
    }

    async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { token, role } = req.body;

            if(!token) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.NO_TOKEN);
            }

            const result = await this._authService.googleAuth(token, role);

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

    async getNewAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                // throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.REFRESH_TOKEN_MISSING);
                sendResponse(res, HttpStatus.UNAUTHORIZED, {}, HttpResponse.REFRESH_TOKEN_MISSING);
                return
            }

            const { user, accessToken, subscription } = await this._authService.getNewAccessToken(refreshToken);

            sendResponse(res, HttpStatus.OK, {
                    user,
                    token: accessToken,
                    subscription
            }, "New access token issued");
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const { password, newPassword, confirmPassword } = req.body;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            if(newPassword !== confirmPassword) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.PASSWORD_NOT_MATCH);
            }
            const { message } = await this._authService.changePassword(userId, password, newPassword);
            sendResponse(res, HttpStatus.OK, {}, message);
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            clearCookie(res);

            sendResponse(res, HttpStatus.OK, {}, HttpResponse.LOGOUT_SUCCESS);
        } catch (error) {
            next(error);
        }
    }
};