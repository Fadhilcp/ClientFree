import { UserListingDto } from "dtos/userListing.dto";
import { IUserDocument } from "../../types/user.type";
import { UserProfileDto } from "dtos/profile.dto.types";
import { PaginatedResult } from "types/pagination";


export interface IProfileService {
    getMyProfile(userId : string) : Promise<UserProfileDto>;
    updateProfile(userId : string, data : Partial<IUserDocument>) : Promise<UserProfileDto>;
    getUserProfileById(id : string) : Promise<UserProfileDto>;
    getAllUsers(page: number, limit: number): Promise<PaginatedResult<UserListingDto>>
}