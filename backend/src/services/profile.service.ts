import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { IUserRepository } from "repositories/interfaces/IUserRepository";
import { IProfileService } from "./interface/IProfileService";
import { IUser, IUserDocument } from "../types/user.type";
import { createHttpError } from "../utils/httpError.util";
import { mapUserToListingDto } from "mappers/userListing.mapper";
import { mapUserProfile } from "mappers/mapUserProfile";
import { UserProfileDto } from "dtos/profile.dto.types";
import { UserListingDto } from "dtos/userListing.dto";
import { PaginatedResult } from "types/pagination";
import { calculateProfileCompletion } from "utils/profileCompletion";
import { FilterQuery } from "mongoose";
import cloudinary from "config/cloudinary.config";
import { uploadToCloudinary } from "utils/cloudinary.helper";

export class ProfileService implements IProfileService {

    constructor(private userRepository: IUserRepository){}

    async getMyProfile(userId: string): Promise<UserProfileDto> {
        const user = await this.userRepository.findByIdWithSkills(userId);
        console.log("🚀 ~ ProfileService ~ getMyProfile ~ user:", user)

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return mapUserProfile(user);
    }

    async updateProfile(userId: string, data: Partial<IUser>): Promise<UserProfileDto> {
        const updatedUser = await this.userRepository.findByIdAndUpdate(userId, data);

        if(!updatedUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        //to check the user is completed profile or not 
        const isCompeleted = calculateProfileCompletion(updatedUser);
        if(updatedUser.isProfileCompleted !== isCompeleted){
            updatedUser.isProfileCompleted = isCompeleted;
            await updatedUser.save();
        }

        return mapUserProfile(updatedUser);
    }

    async getUserProfileById(id: string): Promise<UserProfileDto> {
        const user = await this.userRepository.findById(id);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return mapUserProfile(user);
    }

    async getAllUsers(search: string, page=1, limit=10): Promise<PaginatedResult<UserListingDto>> {
        const filter: FilterQuery<IUserDocument> = {};
        if(search){
           filter.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { role: { $regex: search, $options: "i" } }
            ]
        }
        const result = await this.userRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(mapUserToListingDto)
        };
    }

    async setProfileImage(userId: string, file: Express.Multer.File): Promise<{profileImage: string}> {
        const uploadResult = await uploadToCloudinary(file, {
            folder: "profile_images",
            public_id: `user_${userId}`,
            overwrite: true,
            resource_type: "image",
        });
        return { profileImage: uploadResult.secure_url }
    }

    async removeProfileImage(userId: string): Promise<{ profileImage: string }> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw createHttpError(HttpStatus.NOT_FOUND, "User not found");

        if (user.profileImage) {
             // extract public_id
            const publicId = user.profileImage.split("/").pop()?.split(".")[0];
            await cloudinary.uploader.destroy(`profile_images/${publicId}`);
        }

        // remove image url 
        user.profileImage = "";
        await user.save();

        return { profileImage: "" };
    }
}