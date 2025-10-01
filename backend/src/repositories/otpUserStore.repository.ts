import { BaseRepository } from "./base.repository.js";
import otpUserStore from "../models/otpUserStore.js";
import { IOtpUserStoreDocument } from "../types/otpUserStore.type.js";

export class OtpUserStoreRepository extends BaseRepository<IOtpUserStoreDocument>{
    constructor(){
        super(otpUserStore);
    }

    findByEmail(email : string) : Promise<IOtpUserStoreDocument | null>{
        return this.model.findOne({email});
    }

    findByEmailAndOtp(email : string, otp : string) : Promise<IOtpUserStoreDocument | null>{
        return this.model.findOne({email,otp});
    }
}