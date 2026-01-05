import { UserListingDto } from "../../dtos/userListing.dto";
import { IUser } from "../../types/user.type";
import { UserProfileDto } from "../../dtos/profile.dto.types";
import { PaginatedResult } from "../../types/pagination";
import { FreelancerListItemDto } from "../../dtos/freelancerProfile.dto";


export interface IUserService {
    getMyProfile(userId : string) : Promise<UserProfileDto>;
    updateProfile(userId : string, userData : Partial<IUser>) : Promise<UserProfileDto>;
    getUserProfileById(userId : string) : Promise<UserProfileDto>;
    getAllUsers(search: string, page: number, limit: number): Promise<PaginatedResult<UserListingDto>>;
    setProfileImage(userId: string, file: Express.Multer.File): Promise<{ profileImage: string }>;
    removeProfileImage(userId: string): Promise<{ profileImage: string }>;
    changeUserStatus(userId: string, status: 'active' | 'inactive' | 'banned' ): Promise<UserProfileDto>;
    addFreelancerInterest(clientId: string, freelancerId: string): Promise<void>;
    removeFreelancerInterest(
        clientId: string, freelancerId: string
    ): Promise<void>;

    getFreelancers(
        clientId: string, search: string, limit: number, cursor?: string, filters?: {
            location?: string;
            experience?: string;
            hourlyRateMin?: number;
            hourlyRateMax?: number;
            ratingMin?: number;
        }
    ): Promise<{ freelancers: FreelancerListItemDto[], nextCursor: string | null }>;
    getInterestedFreelancers(
        clientId: string, search: string, limit: number, cursor?: string, filters?: {
            location?: string;
            experience?: string;
            hourlyRateMin?: number;
            hourlyRateMax?: number;
            ratingMin?: number;
        }
    ): Promise<{ freelancers: FreelancerListItemDto[], nextCursor: string | null }>;
}