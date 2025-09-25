import { Schema , model } from "mongoose";
import { IPendingUser, IPendingUserDocument } from "../interfaces/repositories/IPendingUserRepository.js";

const pendingUserSchema = new Schema({
    username : { type : String, required : true},
    email : { type : String , required : true, unique : true},
    password : { type : String , required : true},
    role : { type : String, required : true},
    otp : { type : String , required : true},
    expiresAt : { type : Date, required : true}
});

export default model<IPendingUserDocument>('PendingUser',pendingUserSchema)