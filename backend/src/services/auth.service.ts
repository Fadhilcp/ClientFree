import { IUser, IUserDocument } from "../types/user.type.js";
import { IUserRepository } from "../interfaces/repositories/IUserRepository.js";
import { IAuthService } from "../interfaces/services/IAuthService.js";
import { generateOtp } from "../utils/generateOtp.js";
import bcrypt from 'bcrypt'
import { IPendingUser, IPendingUserRepository } from "../interfaces/repositories/IPendingUserRepository.js";
import { sendOtpEmail } from "../utils/mailer.util.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.util.js";
import { SanitizedUser } from "../types/user.dto.js";
import { Types } from "mongoose";
import { AuthPayload } from "../types/auth.type.js";


export class AuthService implements IAuthService {

    constructor(private userRepository : IUserRepository, private pendingUserRepoitory : IPendingUserRepository){};

    async signUp(data : IPendingUser) : Promise<void>{

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
        console.log("🚀 ~ AuthService ~ verifyOtp ~ pendingUser:", pendingUser)
        if(!pendingUser) throw new Error('Invalid OTP or email');
        if(pendingUser.expiresAt < new Date()) throw new Error('OTP has expired');

        const createdUser = await this.userRepository.create({
            username : pendingUser.username,
            email : pendingUser.email,
            password : pendingUser.password,
            role : pendingUser.role
        })

        await this.pendingUserRepoitory.delete(pendingUser._id);

         const payload: AuthPayload = {
            _id: createdUser._id.toString(),
            email: createdUser.email,
            role: createdUser.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const sanitizedUser = {
            _id : createdUser._id as Types.ObjectId,
            username : createdUser.username,
            email : createdUser.email,
            role : createdUser.role,
        }
        return { user : sanitizedUser, accessToken, refreshToken}
    }


    async accessRefreshToken(token : string) {
        
        if(!token){
            throw new Error('Token not provided')
        }

        const decoded = verifyRefreshToken(token);

        
        const userId = decoded._id;
        if (!userId) {
            throw new Error('Token payload missing user ID');
        }

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const payload : AuthPayload = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        };


        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return { accessToken, newRefreshToken : refreshToken };
    }


    async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: IUserDocument }>  {
        
        const user = await this.userRepository.findByEmail(email);

        if(!user) throw new Error('User not existing!');

        const passwordMatch = await bcrypt.compare(password,user.password);

        if(!passwordMatch) throw new Error('Incorrect password!');

        user.lastLoginAt = new Date();
        await user.save();

         const payload: AuthPayload = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return { accessToken, refreshToken , user};
    }
}