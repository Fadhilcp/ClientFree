import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { IUserRepository } from "repositories/interfaces/IUserRepository";
import { IProfileService } from "./interface/IProfileService";
import { IUserDocument } from "../types/user.type";
import { createHttpError } from "../utils/httpError.util";
import { mapUserToListingDto } from "mappers/userListing.mapper";
import { mapUserProfile } from "mappers/mapUserProfile";
import { UserProfileDto } from "dtos/profile.dto.types";
import { UserListingDto } from "dtos/userListing.dto";
import { PaginatedResult } from "types/pagination";

export class ProfileService implements IProfileService {

    constructor(private userRepository: IUserRepository){}

    async getMyProfile(userId: string): Promise<UserProfileDto> {
        const user = await this.userRepository.findByIdWithSkills(userId);
        console.log("🚀 ~ ProfileService ~ getMyProfile ~ user:", user)

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return mapUserProfile(user);
    }

    async updateProfile(userId: string, data: Partial<IUserDocument>): Promise<UserProfileDto> {
        const updatedUser = await this.userRepository.findByIdAndUpdate(userId, data);

        if(!updatedUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return mapUserProfile(updatedUser);
    }

    async getUserProfileById(id: string): Promise<UserProfileDto> {
        const user = await this.userRepository.findById(id);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return mapUserProfile(user);
    }

    async getAllUsers(page=1, limit=10): Promise<PaginatedResult<UserListingDto>> {
        const result = await this.userRepository.paginate({}, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(mapUserToListingDto)
        };
    }
}