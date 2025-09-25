import { Document } from "mongoose";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IPendingUser{
    username : string,
    email : string;
    password : string;
    role : "freelancer" | "client" | "admin";
    otp : string;
    expiresAt : Date;
}

export interface IPendingUserDocument extends IPendingUser, Document {}

export interface IPendingUserRepository extends IBaseRepository<IPendingUserDocument>{
    findByEmail(email : string) : Promise<IPendingUserDocument>;
    findByEmailAndOtp(email : string, otp : string) : Promise<IPendingUserDocument | null>; 
}
