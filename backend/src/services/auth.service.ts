import { IUser, IUserDocument } from "../types/user.type.js";
import { IUserRepository } from "../interfaces/repositories/IUserRepository.js";
import { IAuthService } from "../interfaces/services/IAuthService.js";
import { generateOtp } from "../utils/generateOtp.js";
import bcrypt from 'bcrypt'
import { IPendingUser, IPendingUserRepository } from "../interfaces/repositories/IPendingUserRepository.js";
import { sendOtpEmail } from "../utils/mailer.util.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util.js";
import { SanitizedUser } from "../types/user.dto.js";
import { Types } from "mongoose";


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
            await sendOtpEmail(data.email, otp);
            return;
        }

        const hashPassword = await bcrypt.hash(data.password , 10)

        
        await this.pendingUserRepoitory.create({
            username : data.username,
            email : data.email,
            password : hashPassword,
            role : data.role,
            otp,
            expiresAt : new Date(Date.now() + 1 * 60 * 1000)
        });

        
        await sendOtpEmail(data.email, otp);
    }

    async verifyOtp(email: string, otp: string): Promise<{ accessToken : string, refreshToken : string, user : SanitizedUser}> {
        
        const pendingUser = await this.pendingUserRepoitory.findByEmailAndOtp(email,otp);
        if(!pendingUser) throw new Error('Invalid OTP or email');
        if(pendingUser.expiresAt < new Date()) throw new Error('OTP has expired');


        const createdUser = await this.userRepository.create({
            username : pendingUser.username,
            email : pendingUser.email,
            password : pendingUser.password,
            role : pendingUser.role
        })

        await this.pendingUserRepoitory.delete(pendingUser._id);

        const accessToken = generateAccessToken(createdUser);
        const refreshToken = generateRefreshToken(createdUser);

        const sanitizedUser = {
            _id : createdUser._id as Types.ObjectId,
            username : createdUser.username,
            email : createdUser.email,
            role : createdUser.role,
        }

        return { user : sanitizedUser, accessToken, refreshToken}
    }


    async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: IUserDocument }>  {
        
        const user = await this.userRepository.findByEmail(email);

        if(!user) throw new Error('User not existing!');

        const passwordMatch = await bcrypt.compare(password,user.password);

        if(!passwordMatch) throw new Error('Incorrect password!');

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return { accessToken, refreshToken , user}
    }
}