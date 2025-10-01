import { IOtpUserStoreDocument } from "../../types/otpUserStore.type.js";
import { IBaseRepository } from "./IBaseRepository.js";




export interface IOtpUserStoreRepository extends IBaseRepository<IOtpUserStoreDocument>{
    findByEmail(email : string) : Promise<IOtpUserStoreDocument | null>;
    findByEmailAndOtp(email : string, otp : string) : Promise<IOtpUserStoreDocument | null>; 
}
