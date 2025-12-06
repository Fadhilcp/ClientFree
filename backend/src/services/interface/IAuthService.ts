import { SanitizedUser } from "../../dtos/user.dto";
import { IOtpUserStore } from "../../types/otpUserStore.type";
import { UserProfileDto } from "dtos/profile.dto.types";

export interface IAuthService{
    signUp(userData : Partial<IOtpUserStore>) : Promise<void>;
    verifySignupOtp(email : string, otp : string, purpose : string) : Promise<{ accessToken : string, refreshToken : string, user : UserProfileDto }>;
    accessRefreshToken(token : string) : Promise<{ accessToken : string, newRefreshToken : string }>;
    login(email : string , password : string) : Promise<{ accessToken: string; refreshToken: string; user: UserProfileDto }>;
    resendOtp(email : string, purpose : string) : Promise<void>;
    verifyOtp(email : string, otp : string, purpose : string) : Promise<void>;
    forgotPassword(email : string) : Promise<void>;
    resetPassword(email : string, newPassword : string) : Promise<void>;
    changePassword(userId: string, password: string, newPassword: string) : Promise<{ message: string }>;
    googleAuth(access_token: string, role: string) : Promise<{
         accessToken?: string, refreshToken?: string, user?: SanitizedUser, isNewUser?: boolean, needsRole?: boolean
        }>;
    getNewAccessToken(refreshToken: string) : Promise<{ user: UserProfileDto, accessToken: string }>;
}