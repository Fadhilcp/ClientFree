import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { setCookie } from "../utils/refreshCookie.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { createHttpError } from "../utils/httpError.util";


export class AuthController {
    constructor(private service : IAuthService){}

    async signUp(req : Request, res : Response, next : NextFunction) : Promise<void>{
        try {
            const { username, email , password, role } = req.body;

            await this.service.signUp({ username, email, password, role} as any);

            res.status(HttpStatus.CREATED).json({ 
                message : "OTP sent to your email. Please verify to complete signup",
                email
            });
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

            res.status(HttpStatus.OK).json({
                success : true,
                messsage : "SignUp complete",
                token : accessToken,
                user : {
                    _id : user._id,
                    username : user.username,
                    email : user.email,
                    role : user.role
                },
            });
        } catch (error : any) {
            next(error)
        }
    };

    async login(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, password } = req.body;

            const { user, accessToken, refreshToken } = await this.service.login(email, password);
            
            setCookie(res, refreshToken);
            
            res.status(200).json({
                success : true,
                messsage : "login complete",
                token : accessToken,
                user : {
                    _id : user._id,
                    username : user.username,
                    email : user.email,
                    role : user.role
                },
            });
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

            res.status(HttpStatus.OK).json({ message : 'OTP sent to your email'});
            
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
            res.status(HttpStatus.OK).json({ message : HttpResponse.OTP_RESENT_SUCCESS });  
        } catch (error : any) {
            next(error)
        }
    }

    async verifyOtp(req : Request, res : Response, next : NextFunction) : Promise<void> {
        try {
            const { email, otp, purpose } = req.body;

            if (!email || !otp || !purpose) {
               throw createHttpError(HttpStatus.BAD_REQUEST, 'Email, OTP, and purpose are required');
            }
        
            await this.service.verifyOtp(email, otp, purpose);

            res.status(HttpStatus.OK).json({ message : HttpResponse.OTP_VERIFIED_SUCCESS });
            
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

            res.status(HttpStatus.OK).json({ message : HttpResponse.PASSWORD_CHANGE_SUCCESS })
            
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

            res.status(HttpStatus.OK).json({ success : true, token : accessToken})
                
        } catch (error : any) {
            next(error)
        }
    }
};