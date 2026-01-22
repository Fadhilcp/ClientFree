import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { IUserRepository } from "repositories/interfaces/IUserRepository";
import { IUserService } from "./interface/IUserService";
import { IUser, IUserDocument } from "../types/user.type";
import { createHttpError } from "../utils/httpError.util";
import { mapUserToListingDto, mapUserToSelect } from "../mappers/userListing.mapper";
import { mapUserProfile } from "../mappers/mapUserProfile";
import { UserProfileDto } from "../dtos/profile.dto.types";
import { UserListingDto } from "../dtos/userListing.dto";
import { PaginatedResult } from "../types/pagination";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import { FilterQuery } from "mongoose";
import cloudinary from "../config/cloudinary.config";
import { uploadToCloudinary } from "../utils/cloudinary.helper";
import { FreelancerListItemDto } from "../dtos/freelancerProfile.dto";
import { mapUserToFreelancerListItemDto } from "../mappers/freelancer.mapper";
import { UserToSelectDto } from "dtos/user.dto";

export class UserService implements IUserService {

    constructor(
        private _userRepository: IUserRepository,
    ){}

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

    async getFreelancers(
        clientId: string, search: string, limit: number, cursor?: string, filters?: {
            location?: string;
            experience?: string;
            hourlyRateMin?: number;
            hourlyRateMax?: number;
            ratingMin?: number;
        }
    ): Promise<{ freelancers: FreelancerListItemDto[], nextCursor: string | null }> {

        const filter: FilterQuery<IUserDocument> = { role: "freelancer", isProfileCompleted: true };

        if(search?.trim()){
            filter.$or = [
                { username: { $regex: search, $options: "i" }},
                { name: { $regex: search, $options: "i" }},
                { professionalTitle: { $regex: search, $options: "i" }}
            ];
        }

        if (filters?.location?.trim()) {
            const loc = filters.location.trim();

            filter.$or = [
                ...(filter.$or ?? []),
                { "location.city": { $regex: loc, $options: "i" } },
                { "location.state": { $regex: loc, $options: "i" } },
                { "location.country": { $regex: loc, $options: "i" } },
            ];
        }

        if (filters?.experience) {
            filter.experienceLevel = filters.experience;
        }

        if (
            filters?.hourlyRateMin !== undefined ||
            filters?.hourlyRateMax !== undefined
        ) {
            filter.hourlyRate = {};
            if (filters.hourlyRateMin !== undefined) {
                filter.hourlyRate.$gte = filters.hourlyRateMin;
            }
            if (filters.hourlyRateMax !== undefined) {
                filter.hourlyRate.$lte = filters.hourlyRateMax;
            }
        }

        if (filters?.ratingMin !== undefined) {
            filter["ratings.asFreelancer"] = { $gte: filters.ratingMin };
        }


        if(cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { $lt: cursor };
        }

        const freelancers = await this._userRepository.findWithSkillsPaginated(filter, limit);

        const nextCursor = freelancers.length > 0
        ? freelancers[freelancers.length - 1]._id.toString()
        : null;

        const client = clientId 
            ? await this._userRepository.findById(clientId) 
            : null;
        // if no client or user is not a client, there are no interested freelancers
        if (!client || client.role !== "client") {
            return {
                freelancers: freelancers.map(mapUserToFreelancerListItemDto),
                nextCursor
            };
        }

        const interestedFreelancerIds: string[] =
            (client.interests
                ?.filter(i => i.type === "clientFreelancer" && i.targetUserId)
                .map(i => i.targetUserId!.toString())
                .filter((id): id is string => Boolean(id))) ?? [];


        return {
            freelancers: freelancers.map(f => ({
                ...mapUserToFreelancerListItemDto(f),
                isInterested: interestedFreelancerIds.includes(f.id.toString())
            })),
            nextCursor
        }
    }

    async getInterestedFreelancers(
        clientId: string, search: string, limit: number, cursor?: string, filters?: {
            location?: string;
            experience?: string;
            hourlyRateMin?: number;
            hourlyRateMax?: number;
            ratingMin?: number;
        }
    ): Promise<{ freelancers: FreelancerListItemDto[], nextCursor: string | null }> {

        const client = await this._userRepository.findById(clientId);
        if(!client) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        const freelancerIds = client.interests
        ?.filter(i => i.type === "clientFreelancer")
        .map(i => i.targetUserId?.toString());

        if(!freelancerIds?.length) return { freelancers: [], nextCursor: null };

        const filter: FilterQuery<IUserDocument> = {
             _id: { $in: freelancerIds }, role: "freelancer", isProfileCompleted: true 
        };
        // search
        if (search?.trim()) {
            filter.$or = [
                { username: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
                { professionalTitle: { $regex: search, $options: "i" } }
            ];
        }
        if (filters?.location?.trim()) {
            const loc = filters.location.trim();

            filter.$or = [
                ...(filter.$or ?? []),
                { "location.city": { $regex: loc, $options: "i" } },
                { "location.state": { $regex: loc, $options: "i" } },
                { "location.country": { $regex: loc, $options: "i" } },
            ];
        }

        if (filters?.experience) {
            filter.experience = filters.experience;
        }

        if (
            filters?.hourlyRateMin !== undefined ||
            filters?.hourlyRateMax !== undefined
        ) {
            filter.hourlyRate = {};
            if (filters.hourlyRateMin !== undefined) {
                filter.hourlyRate.$gte = filters.hourlyRateMin;
            }
            if (filters.hourlyRateMax !== undefined) {
                filter.hourlyRate.$lte = filters.hourlyRateMax;
            }
        }

        if (filters?.ratingMin !== undefined) {
            filter["ratings.asFreelancer"] = { $gte: filters.ratingMin };
        }

        // cursor for infinite scroll
        if(cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { 
                $in: freelancerIds,
                $lt: cursor
            };
        }

        const freelancers = await this._userRepository.findWithSkillsPaginated(filter, limit);
        // setting cursor
        const nextCursor = freelancers.length > 0
        ? freelancers[freelancers.length - 1]._id.toString()
        : null

        return {
            freelancers: freelancers.map(freelancer => ({
                ...mapUserToFreelancerListItemDto(freelancer),
                isInterested: freelancerIds.includes(freelancer.id)
            })),
            nextCursor
        }
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

    async searchUsersForSelect(search: string, page: number, limit: number)
    : Promise<UserToSelectDto[]> {

        if(!search.trim()) return [];

        const filter: FilterQuery<IUserDocument> = {
            $or: [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        };

        const users = await this._userRepository.searchForSelect(
            filter,
            page,
            limit
        );

        return users.map(u => ({
            id: u._id.toString(),
            label: `${u.username} (${u.email})`
        }));
    }

    async getUsersByIds(userIds: string[]): Promise<UserToSelectDto[]> {

        const users = await this._userRepository.findByIds(userIds);

        return users.map(mapUserToSelect);
    }
}