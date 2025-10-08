import { IUserRepository } from "repositories/interfaces/IUserRepository";
import { IAuthService } from "./interface/IAuthService";
import { generateOtp } from "../utils/generateOtp";
import bcrypt from 'bcrypt'
import { IOtpUserStoreRepository } from "repositories/interfaces/IOtpUserStoreRepository";
import { sendOtpEmail } from "../utils/mailer.util";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.util";
import { SanitizedUser } from "../types/user.dto";
import { Types } from "mongoose";
import { AuthPayload, OtpPurpose } from "../types/auth.type";
import { IOtpUserStore } from "../types/otpUserStore.type";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { createHttpError } from "../utils/httpError.util";
import axios from "axios";


export class AuthService implements IAuthService {

    constructor(private userRepository : IUserRepository, private otpUserStoreRepository : IOtpUserStoreRepository){};

    async signUp(data : IOtpUserStore) : Promise<void> {
    console.log("🚀 ~ AuthService ~ signUp ~ data:", data)

        const existingUser = await this.userRepository.findByEmail(data.email);
        console.log("🚀 ~ AuthService ~ signUp ~ existingUser:", existingUser)
        const pendingUser = await this.otpUserStoreRepository.findByEmail(data.email);

        if(existingUser){
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.EMAIL_EXIST)
        }
        const otp = generateOtp();
        console.log("🚀 ~ AuthService ~ signUp ~ otp:", otp)

        if(pendingUser){
            await this.otpUserStoreRepository.updateOne({email : data.email},{otp , expiresAt : new Date(Date.now() + 1 * 60 * 1000)});
            await sendOtpEmail(data.email, otp);
            return;
        }

        if(!data.password) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.PASSWORD_REQUIRED)
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
        console.log("🚀 ~ AuthService ~ verifySignupOtp ~ purpose:", purpose)
        console.log("🚀 ~ AuthService ~ verifySignupOtp ~ otp:", otp)
        
        const pendingUser = await this.otpUserStoreRepository.findByEmailAndOtp(email,otp);
        console.log("🚀 ~ AuthService ~ verifySignupOtp ~ pendingUser:", pendingUser)
        
        if(!pendingUser || pendingUser.purpose !== purpose) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_INCORRECT);
        if(pendingUser.expiresAt < new Date()) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.OTP_EXPIRED);

        const createdUser = await this.userRepository.create({
            username : pendingUser.username,
            email : pendingUser.email,
            password : pendingUser.password,
            role : pendingUser.role,
            provider : 'local'
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
        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

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
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.NO_TOKEN);
        }

        const decoded = verifyRefreshToken(token);
        console.log("🚀 ~ AuthService ~ accessRefreshToken ~ decoded:", decoded)

        
        const userId = decoded._id;
        if (!userId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.NO_PAYLOAD);
        }

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
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


    async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: SanitizedUser }>  {
        
        const user = await this.userRepository.findByEmail(email);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        if (!user.password || user.provider === 'google') {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Password login not allowed for Google account");
        }

        const passwordMatch = await bcrypt.compare(password,user.password);
        console.log("🚀 ~ AuthService ~ login ~ passwordMatch:", passwordMatch)

        if(!passwordMatch) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.PASSWORD_INCORRECT);

        user.lastLoginAt = new Date();
        await user.save();

        const payload: AuthPayload = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const sanitizedUser = {
            _id : user._id as Types.ObjectId,
            username : user.username,
            email : user.email,
            role : user.role,
        }

        return { accessToken, refreshToken , user: sanitizedUser };
    }


    async resendOtp(email : string, purpose : OtpPurpose) : Promise<void>{
    console.log("🚀 ~ AuthService ~ resendOtp ~ email : string, purpose :", email, purpose )

        const [user, pendingUser] = await Promise.all([
            this.userRepository.findOne({email}),
            this.otpUserStoreRepository.findOne({email, purpose})
        ]);

        if (purpose === 'signup' && user) {
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.USER_EXIST);
        }
        if (purpose === 'forgot-password' && !user) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }
        if(!pendingUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.OTP_NOT_FOUND);

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

        await this.otpUserStoreRepository.updateOne(
            {email, purpose},
            {otp, expiresAt}
        )

        console.log('resend otp service has been done')

        await sendOtpEmail(email, otp, purpose);
    }

    async verifyOtp(email : string, otp : string, purpose : OtpPurpose) : Promise<void> {
        const record = await this.otpUserStoreRepository.findOne({email, purpose});
        console.log("🚀 ~ AuthService ~ verifyOtp ~ record:", record)

        if(!record || record.otp !== otp){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_INCORRECT);
        }

        const now = new Date();
        if(record.expiresAt < now){
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_EXPIRED);
        }

        switch (purpose) {
            case 'email-change':
            if (!record.newEmail) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.EMAIL_REQUIRED);
            await this.userRepository.updateOne({ email }, { email: record.newEmail });
            await this.otpUserStoreRepository.deleteOne({ email, purpose });
            break;

            case 'phone-change':
            if (!record.newPhone) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.PHONE_REQUIRED);
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
            createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.UNEXPECTED_KEY_FOUND);
        }
        
    }

    async resetPassword(email : string, newPassword : string): Promise<void> {
        console.log("🚀 ~ AuthService ~ resetPassword ~ email:", email)
        console.log("🚀 ~ AuthService ~ resetPassword ~ newPassword:", newPassword)
        const [user, otpRecord] = await Promise.all([
            this.userRepository.findOne({email}),
            this.otpUserStoreRepository.findOne({email, isVerified: true })
        ]);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        if(!otpRecord) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.OTP_VERIFICATION_REQUIRED);

        const now = new Date();
        const maxWindow = 5 * 60 * 1000;

        if(!otpRecord.verifiedAt || now.getTime() - otpRecord.verifiedAt.getTime() > maxWindow){
            await this.otpUserStoreRepository.deleteOne({email, purpose : 'forgot-password'});
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.PASSWORD_RESET_EXPIRED);
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        await this.userRepository.updateOne({email},{ password : hashPassword });
        await this.otpUserStoreRepository.deleteOne({email, purpose : 'forgot-password'});
    } 

    async googleAuth(access_token: string, role: 'freelancer' | 'client') :Promise<{
         accessToken ?: string, refreshToken ?: string, user ?: SanitizedUser, isNewUser?: Boolean, needsRole?: Boolean,
        }>{
        console.log("🚀 ~ AuthService ~ googleAuth ~ role:", role)
        try {

            const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}`},
            });
            console.log("🚀 ~ AuthService ~ googleAuth ~ data:", data)

            const { email, name, picture } = data;
            console.log("🚀 ~ AuthService ~ googleAuth ~ email:", email)

            if(!email) throw createHttpError(HttpStatus.BAD_REQUEST,HttpResponse.EMAIL_REQUIRED);

            let user = await this.userRepository.findOne({email});
            console.log("🚀 ~ AuthService ~ googleAuth ~ user:", user)

            //to identify user is new or not
            let isNewUser = false;
            if(!user) {

                if (!role) return { needsRole: true };

                user = await this.userRepository.create({
                    username: name,
                    email,
                    profileImage: picture,
                    role,
                    provider: 'google'
                });
                isNewUser = true;
            }

            const payload: AuthPayload = {
                _id: user._id.toString(),
                email: user.email,
                role: user.role,
            };

            const refreshToken = generateRefreshToken(payload);
            const accessToken = generateAccessToken(payload);

            const sanitizedUser = {
                _id : user._id as Types.ObjectId,
                username : user.username,
                email : user.email,
                role : user.role,
            }

            return { user: sanitizedUser, refreshToken, accessToken, isNewUser };
            
        } catch (error: any) {
            console.error('googleAuth service error',error.message)
            throw error;
        }
    }

    async verifyUser(userId: string): Promise<{ user: SanitizedUser; accessToken?: string; refreshToken?: string; }> {
        
        const user = await this.userRepository.findById(userId);

        if(!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }

        // to generate new token for each request when verifying user
        // const payload: AuthPayload = {
        //     _id: user._id.toString(),
        //     email: user.email,
        //     role: user.role,
        // };

        // const accessToken = generateAccessToken(payload);
        // const refreshToken = generateRefreshToken(payload);

        const sanitizedUser = {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        };

        return { user: sanitizedUser };
    }
} 