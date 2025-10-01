import { Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService.js";
import { setCookie } from "../utils/refreshCookie.util.js";


export class AuthController {
    constructor(private service : IAuthService){}

    async signUp(req : Request, res : Response) : Promise<void>{
        try {
            const { username, email , password, role } = req.body;

            await this.service.signUp({ username, email, password, role} as any);

            res.status(201).json({ 
                message : "OTP sent to your email. Please verify to complete signup",
                email
            });
        } catch (error : any) {
            res.status(400).json({ error : error.message})
        }
    };

    async verifySignupOtp(req : Request, res : Response) : Promise<void> {
        try {
            const { email, otp, purpose } = req.body;
            console.log(email,otp)

            const { user, accessToken, refreshToken } = await this.service.verifySignupOtp(email, otp, purpose);

            setCookie(res, refreshToken);

            res.status(200).json({
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
            res.status(400).json({ error : error.message })
        }
    };

    async accessRefreshToken(req : Request, res : Response) : Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            const { accessToken, newRefreshToken } = await this.service.accessRefreshToken(refreshToken);

            setCookie(res, newRefreshToken);

            res.status(200).json({ success : true, token : accessToken})
                
        } catch (error : any) {
            res.status(400).json({ error : error.message })
        }
    }


    async login(req : Request, res : Response) : Promise<void> {
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
            console.log(error.message)
            res.status(400).json({ error : error.message });
        }
    };

    async forgotPassword(req : Request, res : Response) : Promise<void> {
        try {

            const { email } = req.body;
            console.log("🚀 ~ AuthController ~ forgotPassword ~ email:", email)

            if(!email || typeof email !== 'string') {
            res.status(400).json({ error : 'Valid email is required' });
            return;
            }

            console.log('auth controller - forgotpassword --')

            await this.service.forgotPassword(email);

            res.status(200).json({ message : 'OTP sent to your email'});
            
        } catch (error : any) {
            res.status(500).json({ error : error.message })
        }
    }

    async resendOtp(req : Request, res : Response) : Promise<void> {
        try {
            const { email, purpose } = req.body;

            if(!email){
                res.status(400).json({ error : 'Valid email is required' });
            }

            if(!['signup','forgot-password','email-change', 'phone-change'].includes(purpose)){
                res.status(400).json({ error : 'Invalid OTP purpose' });
            }

            await this.service.resendOtp(email, purpose);
            res.status(200).json({ message : 'OTP resent successfully'});  
        } catch (error : any) {
            res.status(400).json({ error : error.message });
        }
    }

    async verifyOtp(req : Request, res : Response) : Promise<void> {
        try {
            const { email, otp, purpose } = req.body;

            if (!email || !otp || !purpose) {
               res.status(400).json({ error: 'Email, OTP, and purpose are required' });
               return;
            }

        
            await this.service.verifyOtp(email, otp, purpose);

            res.status(200).json({ message : 'OTP verified' })
            
        } catch (error : any) {
            res.status(400).json({ error : error.message })
        }
    }

    async resetPassword(req : Request, res : Response) : Promise<void> {
        try {

            const { email , password } = req.body;

            if (!email || !password) {
               res.status(400).json({ error: 'Email and valid new password are required' });
               return;
            }

            await this.service.resetPassword(email, password);

            res.status(200).json({ message : 'Password updated successfully' })
            
        } catch (error : any) {
            res.status(400).json({ error : error.message })
        }
    }
};