import { UserListingDto } from "dtos/userListing.dto";
import { IUser } from "../../types/user.type";
import { UserProfileDto } from "dtos/profile.dto.types";
import { PaginatedResult } from "types/pagination";


export interface IProfileService {
    getMyProfile(userId : string) : Promise<UserProfileDto>;
    updateProfile(userId : string, data : Partial<IUser>) : Promise<UserProfileDto>;
    getUserProfileById(id : string) : Promise<UserProfileDto>;
    getAllUsers(search: string, page: number, limit: number): Promise<PaginatedResult<UserListingDto>>;
    setProfileImage(userId: string, file: Express.Multer.File): Promise<{ profileImage: string }>;
    removeProfileImage(userId: string): Promise<{ profileImage: string }>;
}