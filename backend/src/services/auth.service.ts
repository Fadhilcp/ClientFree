import { IUser } from "../types/user.type.js";
import { IUserRepository } from "../interfaces/repositories/IUserRepository.js";
import { IAuthService } from "../interfaces/services/IAuthService.js";
import { generateOtp } from "../utils/generateOtp.js";
import bcrypt from 'bcrypt'
import { IPendingUser, IPendingUserRepository } from "../interfaces/repositories/IPendingUserRepository.js";
import { sendOtpEmail } from "../utils/mailer.js";


export class AuthService implements IAuthService {

    constructor(private userRepository : IUserRepository, private pendingUserRepoitory : IPendingUserRepository){};

    async signUp(data : IPendingUser) : Promise<void>{

        console.log("🚀 ~ AuthService ~ signUp ~ otp:")

        const existingUser = await this.userRepository.findByEmail(data.email);
        const pendingUser = await this.pendingUserRepoitory.findByEmail(data.email);

        if(existingUser){
            throw new Error("Email is already is use");
        }

        
        const otp = generateOtp();

        if(pendingUser){
            await this.pendingUserRepoitory.updateOne({email : data.email},{otp , expiresAt : new Date(Date.now() + 1 * 60 * 1000)});
            return;
        }

        console.log("🚀 ~ AuthService ~ signUp ~ otp:", otp)
        const hashPassword = await bcrypt.hash(data.password , 10)

        
        await this.pendingUserRepoitory.create({
            username : data.username,
            email : data.email,
            password : hashPassword,
            role : data.role,
            otp,
            expiresAt : new Date(Date.now() + 1 * 60 * 1000)
        })

        console.log('helloo')

        await sendOtpEmail(data.email, otp)
    }

    // verfiyOtp(email: string, otp: string): Promise<IUser> {
        
    // }


    // login(email: string, password: string): Promise<{ token: string; user: IUser; }> {
        
    // }
}