import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IAuthService } from "./interface/IAuthService";
import { generateOtp } from "../utils/generateOtp";
import bcrypt from 'bcrypt'
import { IOtpUserStoreRepository } from "../repositories/interfaces/IOtpUserStoreRepository";
import { sendOtpEmail } from "../utils/mailer.util";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.util";
import { SanitizedUser } from "../dtos/user.dto";
import { Types } from "mongoose";
import { AuthPayload, OtpPurpose } from "../types/auth.type";
import { IOtpUserStore } from "../types/otpUserStore.type";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { createHttpError } from "../utils/httpError.util";
import axios from "axios";
import { mapUserProfile } from "../mappers/mapUserProfile";
import { UserProfileDto } from "../dtos/profile.dto.types";
import { IUserDocument } from "../types/user.type";
import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { IWalletDocument } from "../types/wallet.type";
import { ISubscriptionService } from "./interface/ISubscriptionService";
import { getActiveFeaturesDto } from "../dtos/subscription.dto";
import { UserRole } from "../constants/user.constants";


export class AuthService implements IAuthService {

    constructor(
        private _userRepository : IUserRepository, 
        private _otpUserStoreRepository : IOtpUserStoreRepository,
        private _walletRepository: IWalletRepository,
        private _subscriptionService: ISubscriptionService,
    ){};

    async signUp(userData : Partial<IOtpUserStore>) : Promise<void> {

        if(!userData.email){
            throw createHttpError(HttpStatus.BAD_REQUEST,HttpResponse.EMAIL_REQUIRED);
        }

        const existingUser = await this._userRepository.findByEmail(userData.email);
        const pendingUser = await this._otpUserStoreRepository.findByEmail(userData.email);

        if(existingUser){
            throw createHttpError(HttpStatus.CONFLICT, HttpResponse.EMAIL_EXIST)
        }
        const otp = generateOtp();

        if(pendingUser){
            await this._otpUserStoreRepository.updateOne({email : userData.email},{otp , expiresAt : new Date(Date.now() + 1 * 60 * 1000)});
            await sendOtpEmail(userData.email, otp);
            return;
        }

        if(!userData.password) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.PASSWORD_REQUIRED)
        const hashPassword = await bcrypt.hash(userData.password , 10);

        await this._otpUserStoreRepository.create({
            username : userData.username,
            email : userData.email,
            password : hashPassword,
            role : userData.role,
            otp,
            expiresAt : new Date(Date.now() + 1 * 60 * 1000),
            purpose : 'signup'
        });
        
        await sendOtpEmail(userData.email, otp);
    }

    async verifySignupOtp(email: string, otp: string, purpose : string): 
    Promise<{ accessToken : string, refreshToken : string, user : UserProfileDto }> 
    {
        
        const pendingUser = await this._otpUserStoreRepository.findByEmailAndOtp(email,otp);
        
        if(!pendingUser || pendingUser.purpose !== purpose) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_INCORRECT);
        if(pendingUser.expiresAt < new Date()) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.OTP_EXPIRED);
        // create user and wallet with db transaction
        const { createdUser } = await this._createUserWithWallet({
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password,
            role: pendingUser.role,
            provider: "local",
        });

        await this._otpUserStoreRepository.delete(pendingUser._id);

         const payload: AuthPayload = {
            _id: createdUser._id.toString(),
            email: createdUser.email,
            role: createdUser.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const user = mapUserProfile(createdUser);
        return { user, accessToken, refreshToken}
    }

    private async _createUserWithWallet(pendingUser: Partial<IUserDocument>): Promise<{ createdUser: IUserDocument; wallet: IWalletDocument }> {

        const createdUser = await this._userRepository.create({
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password,
            role: pendingUser.role,
            provider: "local",
        });

        let wallet: IWalletDocument;
        try {
            wallet = await this._walletRepository.create({
            userId: createdUser._id,
            role: createdUser.role,
            balance: { available: 0, escrow: 0, pending: 0 },
            currency: "INR",
            status: "active",
            });
        } catch {
            // Wallet creation failed — delete the user to avoid inconsistent state
            await this._userRepository.delete(createdUser._id.toString());
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Wallet creation failed")
        }

        return { createdUser, wallet };
    }


    async forgotPassword(email : string) : Promise<void> {

        const user = await this._userRepository.findOne({email});
        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        const otp = generateOtp();
        
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

        const existingRecord = await this._otpUserStoreRepository.findOne({
            email,
            purpose: 'forgot-password',
        });

        if (existingRecord) {
            await this._otpUserStoreRepository.updateOne(
                { email, purpose: 'forgot-password' },
                {
                    otp,
                    isVerified: false,
                    verifiedAt: null,
                    expiresAt,
                }
            );
        } else {
            await this._otpUserStoreRepository.create({
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
        
        const userId = decoded._id;
        if (!userId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.NO_PAYLOAD);
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }
        if (user.status === "banned") {
            throw createHttpError(403, "User is banned");
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


    async login(email: string, password: string)
    : Promise<{ accessToken: string; refreshToken: string; user: UserProfileDto, subscription: getActiveFeaturesDto | null }>  {
        
        const user = await this._userRepository.findByEmail(email);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        if(user.status === 'banned') {
            throw createHttpError(HttpStatus.FORBIDDEN, "User is banned");
        }

        if (!user.password || user.provider === 'google') {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Password login not allowed for Google account");
        }

        const passwordMatch = await bcrypt.compare(password,user.password);

        if(!passwordMatch) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.PASSWORD_INCORRECT);

        user.lastLoginAt = new Date();
        
        await user.save();

        const payload: AuthPayload = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const subscription = await this._subscriptionService.getActiveFeatures(user._id.toString());

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const mappedUser = mapUserProfile(user);

        return { accessToken, refreshToken , user: mappedUser, subscription };
    }


    async resendOtp(email : string, purpose : OtpPurpose) : Promise<void>{

        const [user, pendingUser] = await Promise.all([
            this._userRepository.findOne({email}),
            this._otpUserStoreRepository.findOne({email, purpose})
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

        await this._otpUserStoreRepository.updateOne(
            {email, purpose},
            {otp, expiresAt}
        )

        await sendOtpEmail(email, otp, purpose);
    }

    async verifyOtp(email : string, otp : string, purpose : OtpPurpose) : Promise<void> {
        const record = await this._otpUserStoreRepository.findOne({email, purpose});

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
            await this._userRepository.updateOne({ email }, { email: record.newEmail });
            await this._otpUserStoreRepository.deleteOne({ email, purpose });
            break;

            case 'phone-change':
            if (!record.newPhone) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.PHONE_REQUIRED);
            await this._userRepository.updateOne({ email }, { phone: record.newPhone });
            await this._otpUserStoreRepository.deleteOne({ email, purpose });
            break;

            case 'forgot-password':
            //verifiedAt is to check the validity time of when reset password
            await this._otpUserStoreRepository.updateOne(
                { email, purpose : 'forgot-password' }, 
                { isVerified: true, verifiedAt : new Date() }
            );
            break;

            default:
            createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.UNEXPECTED_KEY_FOUND);
        }
    }

    async resetPassword(email : string, newPassword : string): Promise<void> {
        const [user, otpRecord] = await Promise.all([
            this._userRepository.findOne({email}),
            this._otpUserStoreRepository.findOne({email, isVerified: true })
        ]);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        if(!otpRecord) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.OTP_VERIFICATION_REQUIRED);

        const now = new Date();
        const maxWindow = 5 * 60 * 1000;

        if(!otpRecord.verifiedAt || now.getTime() - otpRecord.verifiedAt.getTime() > maxWindow){
            await this._otpUserStoreRepository.deleteOne({email, purpose : 'forgot-password'});
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.PASSWORD_RESET_EXPIRED);
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        await this._userRepository.updateOne({email},{ password : hashPassword });
        await this._otpUserStoreRepository.deleteOne({email, purpose : 'forgot-password'});
    } 

    async googleAuth(access_token: string, role: UserRole) :Promise<{
         accessToken ?: string, refreshToken ?: string, user ?: SanitizedUser, isNewUser?: boolean, needsRole?: boolean,
        }>{
        try {

            const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}`},
            });

            const { email, name } = data;

            if(!email) throw createHttpError(HttpStatus.BAD_REQUEST,HttpResponse.EMAIL_REQUIRED);

            let user = await this._userRepository.findOne({email});
            //to identify user is new or not
            let isNewUser = false;

            if(!user) {

                if (!role) return { needsRole: true };

                const { createdUser } = await this._createUserWithWallet({
                    username: name,
                    email,
                    password: undefined,
                    role,
                    provider: 'google'
                })

                user = createdUser;
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
            
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('googleAuth service error', error.message);
                throw error;
            } else {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
            }
        }
    }

    async getNewAccessToken(refreshToken: string)
    : Promise<{ user: UserProfileDto; accessToken: string; subscription: getActiveFeaturesDto | null}> {

        const decoded = verifyRefreshToken(refreshToken);
        
        const userId = decoded._id;
        if (!userId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.NO_PAYLOAD);
        }

        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }
        if (user.status === "banned") {
            throw createHttpError(403, "User is banned");
        }

        const payload : AuthPayload = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);

        const subscription = await this._subscriptionService.getActiveFeatures(user._id.toString());

        return { user: mapUserProfile(user), accessToken, subscription };
    }

    async changePassword(userId: string, password: string, newPassword: string): Promise<{ message: string; }> {
        const user = await this._userRepository.findById(userId);
        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        if(user.provider === 'google' && !user.password){
            throw createHttpError(HttpStatus.BAD_REQUEST, `You can't change password because you are a google auth user`);
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if(!isMatch) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.PASSWORD_INCORRECT);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateUser = await this._userRepository.findByIdAndUpdate(
            userId, 
            { password: hashedPassword }
        );

        if(!updateUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return { message: 'Password updated successfully'}
    }
}