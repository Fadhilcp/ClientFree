import { IUserDocument } from "../types/user.type.js";
import { IUserRepository } from "../interfaces/repositories/IUserRepository.js";
import { IAuthService } from "../interfaces/services/IAuthService.js";
import { generateOtp } from "../utils/generateOtp.js";
import bcrypt from 'bcrypt'
import { IOtpUserStoreRepository } from "../interfaces/repositories/IOtpUserStoreRepository.js";
import { sendOtpEmail } from "../utils/mailer.util.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.util.js";
import { SanitizedUser } from "../types/user.dto.js";
import { Types } from "mongoose";
import { AuthPayload, OtpPurpose } from "../types/auth.type.js";
import { IOtpUserStore } from "../types/otpUserStore.type.js";


export class AuthService implements IAuthService {

    constructor(private userRepository : IUserRepository, private otpUserStoreRepository : IOtpUserStoreRepository){};

    async signUp(data : IOtpUserStore) : Promise<void> {
    console.log("🚀 ~ AuthService ~ signUp ~ data:", data)

        const existingUser = await this.userRepository.findByEmail(data.email);
        console.log("🚀 ~ AuthService ~ signUp ~ existingUser:", existingUser)
        const pendingUser = await this.otpUserStoreRepository.findByEmail(data.email);

        if(existingUser){
            throw new Error("Email is already is use");
        }
        const otp = generateOtp();
        console.log("🚀 ~ AuthService ~ signUp ~ otp:", otp)

        if(pendingUser){
            await this.otpUserStoreRepository.updateOne({email : data.email},{otp , expiresAt : new Date(Date.now() + 1 * 60 * 1000)});
            await sendOtpEmail(data.email, otp);
            return;
        }

        if(!data.password) throw new Error('Password is required for signUp');
        const hashPassword = await bcrypt.hash(data.password , 10);

        await this.otpUserStoreRepository.create({
            username : data.username,
            email : data.email,
            password : hashPassword,
            role : data.role,
            otp,
            expiresAt : new Date(Date.now() + 1 * 60 * 1000),
            purpose : 'signup'
        });
        
        await sendOtpEmail(data.email, otp);
    }

    async verifySignupOtp(email: string, otp: string, purpose : string): Promise<{ accessToken : string, refreshToken : string, user : SanitizedUser}> {
        console.log("🚀 ~ AuthService ~ verifySignupOtp ~ otp:", otp)
        
        const pendingUser = await this.otpUserStoreRepository.findByEmailAndOtp(email,otp);
        console.log("🚀 ~ AuthService ~ verifyOtp ~ pendingUser:", pendingUser)
        if(!pendingUser || pendingUser.purpose === purpose) throw new Error('Invalid OTP or email');
        if(pendingUser.expiresAt < new Date()) throw new Error('OTP has expired');

        const createdUser = await this.userRepository.create({
            username : pendingUser.username,
            email : pendingUser.email,
            password : pendingUser.password,
            role : pendingUser.role
        })

        await this.otpUserStoreRepository.delete(pendingUser._id);

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

    async forgotPassword(email : string) : Promise<void> {
    console.log("🚀 ~ AuthService ~ forgotPassword ~ email:", email)

        const user = await this.userRepository.findOne({email});
        console.log("🚀 ~ AuthService ~ forgotPassword ~ user:", user)
        if(!user) throw new Error('User not found');

        const otp = generateOtp();
        console.log("🚀 ~ AuthService ~ forgotPassword ~ otp:", otp)
        
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

        const existingRecord = await this.otpUserStoreRepository.findOne({
            email,
            purpose: 'forgot-password',
        });

        if (existingRecord) {
            await this.otpUserStoreRepository.updateOne(
                { email, purpose: 'forgot-password' },
                {
                    otp,
                    isVerified: false,
                    verifiedAt: null,
                    expiresAt,
                }
            );
        } else {
            await this.otpUserStoreRepository.create({
                email,
                purpose: 'forgot-password',
                otp,
                expiresAt,
            });
        }


        await sendOtpEmail(email, otp, 'Forgot Password');
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
        console.log("🚀 ~ AuthService ~ login ~ passwordMatch:", passwordMatch)

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


    async resendOtp(email : string, purpose : OtpPurpose) : Promise<void>{
    console.log("🚀 ~ AuthService ~ resendOtp ~ email : string, purpose :", email, purpose )

        const [user, pendingUser] = await Promise.all([
            this.userRepository.findOne({email}),
            this.otpUserStoreRepository.findOne({email, purpose})
        ]);

        if (purpose === 'signup' && user) {
            throw new Error('User already exists');
        }
        if (purpose === 'forgot-password' && !user) {
            throw new Error('User not found');
        }
        if(!pendingUser) throw new Error('No pending OTP request found');

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

        await this.otpUserStoreRepository.updateOne(
            {email, purpose},
            {otp, expiresAt}
        )

        console.log('resend otp service has been done')

        await sendOtpEmail(email, otp, purpose)
    }

    async verifyOtp(email : string, otp : string, purpose : OtpPurpose) : Promise<void> {
        const record = await this.otpUserStoreRepository.findOne({email, purpose});
        console.log("🚀 ~ AuthService ~ verifyOtp ~ record:", record)

        if(!record || record.otp !== otp){
            throw new Error('Invalid or expired OTP');
        }

        const now = new Date();
        if(record.expiresAt < now){
            throw new Error('OTP has expired');
        }

        switch (purpose) {
            case 'email-change':
            if (!record.newEmail) throw new Error('Missing new email');
            await this.userRepository.updateOne({ email }, { email: record.newEmail });
            await this.otpUserStoreRepository.deleteOne({ email, purpose });
            break;

            case 'phone-change':
            if (!record.newPhone) throw new Error('Missing new phone number');
            await this.userRepository.updateOne({ email }, { phone: record.newPhone });
            await this.otpUserStoreRepository.deleteOne({ email, purpose });
            break;

            case 'forgot-password':
            //verifiedAt is to check the validity time of when reset password
            await this.otpUserStoreRepository.updateOne(
                { email, purpose : 'forgot-password' }, 
                { isVerified: true, verifiedAt : new Date() }
            );
            break;

            default:
            throw new Error('Unsupported OTP purpose');
        }
        
    }

    async resetPassword(email : string, newPassword : string): Promise<void> {
        const [user, otpRecord] = await Promise.all([
            this.userRepository.findOne({email}),
            this.otpUserStoreRepository.findOne({email, isVerified: true })
        ]);

        if(!user) throw new Error('User not found');
        if(!otpRecord) throw new Error('OTP verification required before password reset');

        const now = new Date();
        const maxWindow = 5 * 60 * 1000;

        if(!otpRecord.verifiedAt || now.getTime() - otpRecord.verifiedAt.getTime() > maxWindow){
            await this.otpUserStoreRepository.deleteOne({email, purpose : 'forgot-password'});
            throw new Error('Password reset window expird. Please verify OTP again.')
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        await this.userRepository.updateOne({email},{ password : hashPassword });
        await this.otpUserStoreRepository.deleteOne({email, purpose : 'forgot-password'});
    } 
} 