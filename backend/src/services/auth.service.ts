import { IUser } from "../types/user.type.js";
import { IUserRepository } from "../interfaces/repositories/IUserRepository.js";
import { IAuthService } from "../interfaces/services/IAuthService.js";
import { generateOtp } from "../utils/generateOtp.js";
import bcrypt from 'bcrypt'
import { IPendingUser, IPendingUserRepository } from "../interfaces/repositories/IPendingUserRepository.js";
import { sendOtpEmail } from "../utils/mailer.js";


export class authService implements IAuthService {

    constructor(private userRepository : IUserRepository, private pendingUserRepoitory : IPendingUserRepository){};

    async signUp(data : IPendingUser) : Promise<void>{


        const existingUser = await this.userRepository.findByEmail(data.email);

        if(existingUser){
            throw new Error("Email is already is use");
        }

        const otp = generateOtp();
        const hashPassword = await bcrypt.hash(data.password , 10)

        await this.pendingUserRepoitory.create({
            username : data.username,
            email : data.email,
            password : hashPassword,
            role : data.role,
            otp,
            expiresAt : new Date(Date.now() + 1 + 60 + 1000)
        })

        await sendOtpEmail(data.email, otp)
    }

    // verfiyOtp(email: string, otp: string): Promise<IUser> {
        
    // }


    // login(email: string, password: string): Promise<{ token: string; user: IUser; }> {
        
    // }
}