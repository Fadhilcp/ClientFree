import { IUserDocument } from "../../types/user.type.js";


export interface IProfileService {
    getProfile(userId : string) : Promise<IUserDocument>;
    updateProfile(userId : string, update : Partial<IUserDocument>) : Promise<IUserDocument>;
}