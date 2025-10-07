import { SanitizedUser } from "../../types/user.dto";
import { IUserDocument } from "../../types/user.type";
import { IOtpUserStore } from "../../types/otpUserStore.type";

export interface IAuthService{
    signUp(data : IOtpUserStore) : Promise<void>;
    verifySignupOtp(email : string, otp : string, purpose : string) : Promise<{ accessToken : string, refreshToken : string, user : SanitizedUser}>;
    accessRefreshToken(token : string) : Promise<{ accessToken : string, newRefreshToken : string }>;
    login(email : string , password : string) : Promise<{ accessToken: string; refreshToken: string; user: SanitizedUser }>;
    forgotPassword(email : string) : Promise<void>;
    resendOtp(email : string, purpose : string) : Promise<void>;
    verifyOtp(email : string, otp : string, purpose : string) : Promise<void>;
    resetPassword(email : string, newPassword : string) : Promise<void>;
    googleAuth(access_token: string, role: string) : Promise<{
         accessToken?: string, refreshToken?: string, user?: SanitizedUser, isNewUser?: Boolean, needsRole?: Boolean
        }>;
    verifyUser(userId: string) : Promise<{ user: SanitizedUser, accessToken ?: string, refreshToken?: string }>;

}