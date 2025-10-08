import { IOtpUserStoreDocument } from "../../types/otpUserStore.type";
import { IBaseRepository } from "./IBaseRepository";

export interface IOtpUserStoreRepository extends IBaseRepository<IOtpUserStoreDocument>{
    findByEmail(email : string) : Promise<IOtpUserStoreDocument | null>;
    findByEmailAndOtp(email : string, otp : string) : Promise<IOtpUserStoreDocument | null>; 
}
