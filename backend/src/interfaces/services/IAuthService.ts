import { SanitizedUser } from "../../types/user.dto.js";
import { IUserDocument } from "../../types/user.type.js";
import { IOtpUserStore } from "../../types/otpUserStore.type.js";

export interface IAuthService{
    signUp(data : IOtpUserStore) : Promise<void>;
    verifySignupOtp(email : string, otp : string, purpose : string) : Promise<{ accessToken : string, refreshToken : string, user : SanitizedUser}>;
    accessRefreshToken(token : string) : Promise<{ accessToken : string, newRefreshToken : string }>;
    login(email : string , password : string) : Promise<{ accessToken: string; refreshToken: string; user: IUserDocument }>;
    forgotPassword(email : string) : Promise<void>;
    resendOtp(email : string, purpose : string) : Promise<void>;
    verifyOtp(email : string, otp : string, purpose : string) : Promise<void>;
    resetPassword(email : string, newPassword : string) : Promise<void>;
}