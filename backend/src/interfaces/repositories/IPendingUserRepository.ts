import { Document, ObjectId } from "mongoose";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IPendingUser{
    username : string,
    email : string;
    password : string;
    role : "freelancer" | "client";
    otp : string;
    expiresAt : Date;
}

export interface IPendingUserDocument extends IPendingUser, Document {
    _id : ObjectId
}

export interface IPendingUserRepository extends IBaseRepository<IPendingUserDocument>{
    findByEmail(email : string) : Promise<IPendingUserDocument | null>;
    findByEmailAndOtp(email : string, otp : string) : Promise<IPendingUserDocument | null>; 
}
