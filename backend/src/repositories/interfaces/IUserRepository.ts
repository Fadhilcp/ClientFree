import { FilterQuery } from "mongoose";
import { IUser, IUserDocument } from "../../types/user.type";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUserDocument>{
    findByEmail(email : string) : Promise<IUserDocument | null>;
    findWithSkill(filter: FilterQuery<IUserDocument>) : Promise<IUserDocument[]>;
    findClients() : Promise<IUser[]>;
    findByLocation(city ?: string, country ?: string, state ?: string) : Promise<IUser[]>;
    findByIdWithSkills(userId: string) : Promise<IUserDocument | null>;
}