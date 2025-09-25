import { BaseRepository } from "./base.repository.js";
import pendingUserModel from "../models/pendingUser.model.js";
import { IPendingUserDocument, IPendingUserRepository } from "../interfaces/repositories/IPendingUserRepository.js";

export class PendingUserRepository extends BaseRepository<IPendingUserDocument>{
    constructor(){
        super(pendingUserModel)
    }

    findByEmail(email : string) : Promise<IPendingUserDocument | null>{
        return this.model.findOne({email});
    }

    findByEmailAndOtp(email : string, otp : string) : Promise<IPendingUserDocument | null>{
        return this.model.findOne({email,otp});
    }
}