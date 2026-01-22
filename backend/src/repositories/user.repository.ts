import { BaseRepository } from "./base.repository";
import { IUserDocument } from "../types/user.type";
import userModel from "./../models/user.model"
import { IUserRepository } from "./interfaces/IUserRepository";
import { ClientSession, FilterQuery, ObjectId } from "mongoose";

export class UserRepository 
   extends BaseRepository<IUserDocument>
      implements IUserRepository {
        
    constructor(){
        super(userModel);
    }

    async findByEmail(email : string) : Promise<IUserDocument | null>{
        return this.model.findOne({ email });
    }

    async findStatusById(id: ObjectId | string): Promise<IUserDocument> {
        return this.model.findById(id).select("status");
    }

    async findWithSkill(filter: FilterQuery<IUserDocument>) : Promise<IUserDocument[]>{
        return this.model.find(filter)
        .populate("skills", "name _id");
    }

    async findClients() : Promise<IUserDocument[]>{
        return this.model.find({ role : "client" });
    }

    async findByLocation(city ?: string, country ?: string, state ?: string) : Promise<IUserDocument[]>{

        const filter : Record<string, string> = {};
        
        if(city) filter["location.city"] = city;
        if(country) filter["location.country"] = country;
        if(state) filter["location.state"] = state;

        return this.model.find(filter)
    }

    async findByIdWithSkills(userId: string) : Promise<IUserDocument | null> {
        return this.model.findById(userId).populate("skills", "name _id");
    }

    async findWithSkillsPaginated(
        filter: FilterQuery<IUserDocument>,
        limit: number,
    ): Promise<IUserDocument[]> {
    const paginatedFilter: FilterQuery<IUserDocument> = { ...filter };

    return this.model
        .find(paginatedFilter)
        .sort({ _id: -1 })
        .limit(limit)
        .populate("skills", "name _id")
        .exec();
    }

    async resetSubscriptionState(
        userId: string,
        limits: { invitesRemaining: number; proposalsRemaining: number },
        session: ClientSession
    ): Promise<void> {
        await this.model.updateOne(
            { _id: userId },
            {
                $set: {
                    limits,
                    isVerified: false,
                    subscription: null,
                },
            },
            { session }
        );
    }

    async searchForSelect(
        filter: FilterQuery<IUserDocument>,
        page: number,
        limit: number
    ): Promise<Pick<IUserDocument, "_id" | "username" | "email">[]> {
        return this.model.find(filter)
            .select("username email")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
    }

    async findByIds(userIds: string[]): Promise<Pick<IUserDocument, "_id" | "username" | "email">[]> {
        return this.model.find(
            { _id: { $in: userIds } },
            { username: 1, email: 1 }
        ).lean();
    }
}