import { Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService.js";

export class AuthController {
    constructor(private service : IAuthService){}

    async signUp(req : Request, res : Response) : Promise<void>{
        try {
            
            const { username, email , password, role } = req.body;

            console.log('console from auth controller',username)
            await this.service.signUp({ username, email, password, role} as any);

            console.log('hello')

            res.status(201).json({ 
                message : "OTP sent to your email. Please verify to complete signup",
                email
            });
        } catch (error : any) {
            res.status(400).json({ error : error.message})
        }
    }
}