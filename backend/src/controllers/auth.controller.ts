import { Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService.js";
import { setCookie } from "../utils/refreshCookie.util.js";
import { success } from "zod";

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

    async verifyOtp(req : Request, res : Response) : Promise<void> {
        try {
            const { email, otp } = req.body;
            console.log(email,otp)

            const { user, accessToken, refreshToken } = await this.service.verifyOtp(email, otp);

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
            res.status(400).json({ error : error.message })
        }
    };
};