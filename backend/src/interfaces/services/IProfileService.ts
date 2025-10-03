import { IUserDocument } from "../../types/user.type.js";


export interface IProfileService {
    getMyProfile(userId : string) : Promise<IUserDocument>;
    updateProfile(userId : string, data : Partial<IUserDocument>) : Promise<IUserDocument>;
    getUserProfileById(id : string) : Promise<IUserDocument>;
    getAllUsers() : Promise<IUserDocument[]>;
}