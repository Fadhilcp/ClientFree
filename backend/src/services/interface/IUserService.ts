import { UserListingDto } from "dtos/userListing.dto";
import { IUser } from "../../types/user.type";
import { UserProfileDto } from "dtos/profile.dto.types";
import { PaginatedResult } from "types/pagination";
import { FreelancerListItemDto } from "dtos/freelancerProfile.dto";


export interface IUserService {
    getMyProfile(userId : string) : Promise<UserProfileDto>;
    updateProfile(userId : string, userData : Partial<IUser>) : Promise<UserProfileDto>;
    getUserProfileById(userId : string) : Promise<UserProfileDto>;
    getAllUsers(search: string, page: number, limit: number): Promise<PaginatedResult<UserListingDto>>;
    setProfileImage(userId: string, file: Express.Multer.File): Promise<{ profileImage: string }>;
    removeProfileImage(userId: string): Promise<{ profileImage: string }>;
    changeUserStatus(userId: string, status: 'active' | 'inactive' | 'banned' ): Promise<UserProfileDto>;
    getFreelancers(clientId: string, search: string, page: number, limit: number): Promise<FreelancerListItemDto[]>;
    getInterestedFreelancers(clientId: string): Promise<FreelancerListItemDto[]>;
    addFreelancerInterest(clientId: string, freelancerId: string): Promise<void>;
    removeFreelancerInterest(
        clientId: string, freelancerId: string
    ): Promise<void>;
}