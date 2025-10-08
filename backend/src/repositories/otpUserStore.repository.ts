import { BaseRepository } from "./base.repository";
import otpUserStore from "../models/otpUserStore";
import { IOtpUserStoreDocument } from "../types/otpUserStore.type";
import { IOtpUserStoreRepository } from "./interfaces/IOtpUserStoreRepository";

export class OtpUserStoreRepository 
   extends BaseRepository<IOtpUserStoreDocument>
      implements IOtpUserStoreRepository {
        
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