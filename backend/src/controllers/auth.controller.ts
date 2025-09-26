import { Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService.js";

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
            const { user, accessToken, refreshToken } = await this.service.verifyOtp(email, otp);

            res.status(200).json({
                success : true,
                messsage : "SignUp complete",
                accessToken,
                refreshToken,
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


    async login(req : Request, res : Response) : Promise<void> {
        try {
            const { email, password } = req.body;

            const { user, accessToken, refreshToken } = await this.service.login(email, password);

            res.status(200).json({
                success : true,
                messsage : "login complete",
                accessToken,
                refreshToken,
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