import { HttpResponse } from "../constants/responseMessage.constant.js";
import { HttpStatus } from "../constants/status.constants.js";
import { IUserRepository } from "../interfaces/repositories/IUserRepository.js";
import { IProfileService } from "../interfaces/services/IProfileService.js";
import { IUserDocument } from "../types/user.type.js";
import { createHttpError } from "../utils/httpError.util.js";

export class ProfileService implements IProfileService {

    constructor(private userRepository: IUserRepository){}

    async getMyProfile(userId: string): Promise<IUserDocument> {
        const user = await this.userRepository.findById(userId);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return user;
    }

    async updateProfile(userId: string, data: Partial<IUserDocument>): Promise<IUserDocument> {
        const updatedUser = await this.userRepository.findByIdAndUpdate(userId, data);

        if(!updatedUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return updatedUser;
    }

    async getUserProfileById(id: string): Promise<IUserDocument> {
        const user = await this.userRepository.findById(id);

        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        return user;
    }

    async getAllUsers() {
        return this.userRepository.find({});
    }
}