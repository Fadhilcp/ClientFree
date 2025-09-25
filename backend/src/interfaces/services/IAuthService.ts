import { IUser } from "../../types/user.type.js";
import { IPendingUser } from "../repositories/IPendingUserRepository.js";

export interface IAuthService{
    signUp(data : IPendingUser) : Promise<void>;
    // verfiyOtp(email : string, otp : string) : Promise<IUser>
    // login(email : string , password : string) : Promise<{token : string , user : IUser}>;
}