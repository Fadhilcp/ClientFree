import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { IUserRepository } from "repositories/interfaces/IUserRepository";
import { IUserService } from "./interface/IUserService";
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
import { FreelancerListItemDto } from "dtos/freelancerProfile.dto";
import { mapUserToFreelancerListItemDto } from "mappers/freelancer.mapper";

export class UserService implements IUserService {

    constructor(private _userRepository: IUserRepository){}

    async getMyProfile(userId: string): Promise<UserProfileDto> {
        const user = await this._userRepository.findByIdWithSkills(userId);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return mapUserProfile(user);
    }

    async updateProfile(userId: string, userData: Partial<IUser>): Promise<UserProfileDto> {
        const updatedUser = await this._userRepository.findByIdAndUpdate(userId, userData);

        if(!updatedUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        //to check the user is completed profile or not 
        const isCompeleted = calculateProfileCompletion(updatedUser);
        if(updatedUser.isProfileCompleted !== isCompeleted){
            updatedUser.isProfileCompleted = isCompeleted;
            await updatedUser.save();
        }

        return mapUserProfile(updatedUser);
    }

    async getUserProfileById(userId: string): Promise<UserProfileDto> {
        const user = await this._userRepository.findByIdWithSkills(userId);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return mapUserProfile(user);
    }

    async getAllUsers(search: string, page=1, limit=10): Promise<PaginatedResult<UserListingDto>> {
        const filter: FilterQuery<IUserDocument> = {};
        if(search){
           filter.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { role: { $regex: search, $options: "i" } },
            ]
        }
        const result = await this._userRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
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
        const user = await this._userRepository.findById(userId);
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

    async changeUserStatus(userId: string, status: "active" | "inactive" | "banned" ): Promise<UserProfileDto> {

        if(!["active", "inactive", "banned"].includes(status)){
            throw createHttpError(HttpStatus.BAD_REQUEST,HttpResponse.INVALID_STATUS);
        }

        const existingUser = await this._userRepository.findById(userId);

        if(!existingUser) throw createHttpError(HttpStatus.NOT_FOUND,HttpResponse.USER_NOT_FOUND);

        if(existingUser.status === status) {
            throw createHttpError(HttpStatus.BAD_REQUEST, `User is already ${status}`);
        }

        existingUser.status = status;
        await existingUser.save();
        return mapUserProfile(existingUser);
    }

    async getFreelancers(clientId: string, search: string, page=1, limit=10): Promise<FreelancerListItemDto[]> {
        const filter: FilterQuery<IUserDocument> = { role: "freelancer", isProfileCompleted: true };

        if(search){
            filter.$or = [
                { username: { $regex: search, $options: "i" }},
                { professionalTitle: { $regex: search, $options: "i" }}
            ];
        }

        const freelancers = await this._userRepository.findWithSkill(filter);
        if (!clientId) {
            return freelancers.map(mapUserToFreelancerListItemDto);
        }

        const client = await this._userRepository.findById(clientId);
        if (!client) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        const interestedFreelancerIds: string[] =
            (client.interests
                ?.filter(i => i.type === "clientFreelancer" && i.targetUserId)
                .map(i => i.targetUserId!.toString())
                .filter((id): id is string => Boolean(id))) ?? [];


        return freelancers.map(f => ({
            ...mapUserToFreelancerListItemDto(f),
            isInterested: interestedFreelancerIds.includes(f.id.toString())
        }));
    }

    async getInterestedFreelancers(clientId: string): Promise<FreelancerListItemDto[]> {
        const client = await this._userRepository.findById(clientId);
        if(!client) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        const freelancerIds = client.interests
        ?.filter(i => i.type === "clientFreelancer")
        .map(i => i.targetUserId?.toString());

        if(!freelancerIds?.length) return [];

        const freelancers = await this._userRepository.findWithSkill({ _id: { $in: freelancerIds }, role: "freelancer" });

        return freelancers.map(freelancer => ({
            ...mapUserToFreelancerListItemDto(freelancer),
            isInterested: freelancerIds.includes(freelancer.id)
        }));
    }

    async addFreelancerInterest(clientId: string, freelancerId: string): Promise<void> {
        await this._userRepository.updateOne(
            { _id: clientId },
            {
                $addToSet: {
                    interests: {
                        type: "clientFreelancer",
                        targetUserId: freelancerId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }
        );
    }

    async removeFreelancerInterest(clientId: string, freelancerId: string): Promise<void> {
        await this._userRepository.updateOne(
            { _id: clientId },
            {
                $pull: {
                    interests: {
                        type: "clientFreelancer",
                        targetUserId: freelancerId
                    }
                }
            }
        );
    }
}