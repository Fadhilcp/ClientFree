"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const userListing_mapper_1 = require("../mappers/userListing.mapper");
const mapUserProfile_1 = require("../mappers/mapUserProfile");
const profileCompletion_1 = require("../utils/profileCompletion");
const mongoose_1 = require("mongoose");
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const cloudinary_helper_1 = require("../utils/cloudinary.helper");
const freelancer_mapper_1 = require("../mappers/freelancer.mapper");
const getSignedUrl_util_1 = require("../utils/getSignedUrl.util");
class UserService {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async getMyProfile(userId) {
        const user = await this._userRepository.findByIdWithSkills(userId);
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        const userWithSignedResume = await this._attachResumeSignedUrl(user);
        return (0, mapUserProfile_1.mapUserProfile)(userWithSignedResume);
    }
    async updateProfile(userId, userData) {
        const updatedUser = await this._userRepository.findByIdAndUpdate(userId, userData);
        if (!updatedUser)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        //to check the user is completed profile or not 
        const isCompeleted = (0, profileCompletion_1.calculateProfileCompletion)(updatedUser);
        if (updatedUser.isProfileCompleted !== isCompeleted) {
            updatedUser.isProfileCompleted = isCompeleted;
            await updatedUser.save();
        }
        const userWithSignedResume = await this._attachResumeSignedUrl(updatedUser);
        return (0, mapUserProfile_1.mapUserProfile)(userWithSignedResume);
    }
    async getUserProfileById(userId) {
        const user = await this._userRepository.findByIdWithSkills(userId);
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        const userWithSignedResume = await this._attachResumeSignedUrl(user);
        return (0, mapUserProfile_1.mapUserProfile)(userWithSignedResume);
    }
    async getAllUsers(search, page = 1, limit = 10) {
        const filter = {};
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { role: { $regex: search, $options: "i" } },
            ];
        }
        const result = await this._userRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(userListing_mapper_1.mapUserToListingDto)
        };
    }
    async setProfileImage(userId, file) {
        const uploadResult = await (0, cloudinary_helper_1.uploadToCloudinary)(file, {
            folder: "profile_images",
            public_id: `user_${userId}`,
            overwrite: true,
            resource_type: "image",
        });
        return { profileImage: uploadResult.secure_url };
    }
    async removeProfileImage(userId) {
        const user = await this._userRepository.findById(userId);
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "User not found");
        if (user.profileImage) {
            // extract public_id
            const publicId = user.profileImage.split("/").pop()?.split(".")[0];
            await cloudinary_config_1.default.uploader.destroy(`profile_images/${publicId}`);
        }
        // remove image url 
        user.profileImage = "";
        await user.save();
        return { profileImage: "" };
    }
    async changeUserStatus(userId, status) {
        if (!["active", "inactive", "banned"].includes(status)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.INVALID_STATUS);
        }
        const existingUser = await this._userRepository.findById(userId);
        if (!existingUser)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        if (existingUser.status === status) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, `User is already ${status}`);
        }
        existingUser.status = status;
        await existingUser.save();
        return (0, mapUserProfile_1.mapUserProfile)(existingUser);
    }
    async getFreelancers(clientId, search, limit, cursor, filters) {
        const filter = { role: "freelancer", isProfileCompleted: true };
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
            filter.experienceLevel = filters.experience;
        }
        if (filters?.hourlyRateMin !== undefined ||
            filters?.hourlyRateMax !== undefined) {
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
        if (filters?.skills && filters.skills.length > 0) {
            filter.skills = { $all: filters.skills.map(id => new mongoose_1.Types.ObjectId(id)) };
        }
        if (cursor && cursor !== "undefined" && cursor !== "null") {
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
                freelancers: freelancers.map(freelancer_mapper_1.mapUserToFreelancerListItemDto),
                nextCursor
            };
        }
        const interestedFreelancerIds = (client.interests
            ?.filter(i => i.type === "clientFreelancer" && i.targetUserId)
            .map(i => i.targetUserId.toString())
            .filter((id) => Boolean(id))) ?? [];
        return {
            freelancers: freelancers.map(f => ({
                ...(0, freelancer_mapper_1.mapUserToFreelancerListItemDto)(f),
                isInterested: interestedFreelancerIds.includes(f.id.toString())
            })),
            nextCursor
        };
    }
    async getInterestedFreelancers(clientId, search, limit, cursor, filters) {
        const client = await this._userRepository.findById(clientId);
        if (!client)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        const freelancerIds = client.interests
            ?.filter(i => i.type === "clientFreelancer")
            .map(i => i.targetUserId?.toString());
        if (!freelancerIds?.length)
            return { freelancers: [], nextCursor: null };
        const filter = {
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
        if (filters?.hourlyRateMin !== undefined ||
            filters?.hourlyRateMax !== undefined) {
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
        if (cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = {
                $in: freelancerIds,
                $lt: cursor
            };
        }
        const freelancers = await this._userRepository.findWithSkillsPaginated(filter, limit);
        // setting cursor
        const nextCursor = freelancers.length > 0
            ? freelancers[freelancers.length - 1]._id.toString()
            : null;
        return {
            freelancers: freelancers.map(freelancer => ({
                ...(0, freelancer_mapper_1.mapUserToFreelancerListItemDto)(freelancer),
                isInterested: freelancerIds.includes(freelancer.id)
            })),
            nextCursor
        };
    }
    async addFreelancerInterest(clientId, freelancerId) {
        await this._userRepository.updateOne({ _id: clientId }, {
            $addToSet: {
                interests: {
                    type: "clientFreelancer",
                    targetUserId: freelancerId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        });
    }
    async removeFreelancerInterest(clientId, freelancerId) {
        await this._userRepository.updateOne({ _id: clientId }, {
            $pull: {
                interests: {
                    type: "clientFreelancer",
                    targetUserId: freelancerId
                }
            }
        });
    }
    async searchUsersForSelect(search, page, limit) {
        if (!search.trim())
            return [];
        const filter = {
            $or: [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        };
        const users = await this._userRepository.searchForSelect(filter, page, limit);
        return users.map(u => ({
            id: u._id.toString(),
            label: `${u.username} (${u.email})`
        }));
    }
    async getUsersByIds(userIds) {
        const users = await this._userRepository.findByIds(userIds);
        return users.map(userListing_mapper_1.mapUserToSelect);
    }
    async uploadResume(userId, resume) {
        const user = await this._userRepository.findByIdAndUpdate(userId, {
            resume,
        });
        if (!user) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        }
        return {
            fileUrl: user.resume?.key ?? "",
            uploadedAt: user.resume?.uploadedAt ?? new Date()
        };
    }
    async _attachResumeSignedUrl(user) {
        if (!user.resume?.key) {
            return user;
        }
        const signedUrl = await (0, getSignedUrl_util_1.generateSignedUrl)(user.resume.key);
        return {
            ...user.toObject(),
            resumeSignedUrl: signedUrl,
        };
    }
}
exports.UserService = UserService;
