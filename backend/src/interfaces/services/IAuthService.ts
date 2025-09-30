import { SanitizedUser } from "../../types/user.dto.js";
import { IUserDocument } from "../../types/user.type.js";
import { IPendingUser } from "../repositories/IPendingUserRepository.js";

export interface IAuthService{
    signUp(data : IPendingUser) : Promise<void>;
    verifyOtp(email : string, otp : string) : Promise<{ accessToken : string, refreshToken : string, user : SanitizedUser}>;
    accessRefreshToken(token : string) : Promise<{ accessToken : string, newRefreshToken : string }>;
    login(email : string , password : string) : Promise<{ accessToken: string; refreshToken: string; user: IUserDocument }>;
}