import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { IUserRepository } from "repositories/interfaces/IUserRepository";
import { IProfileService } from "./interface/IProfileService";
import { IUserDocument } from "../types/user.type";
import { createHttpError } from "../utils/httpError.util";

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