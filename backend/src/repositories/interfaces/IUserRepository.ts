import { ClientSession, FilterQuery, ObjectId } from "mongoose";
import { IUser, IUserDocument } from "../../types/user.type";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUserDocument>{
    findByEmail(email : string) : Promise<IUserDocument | null>;
    findStatusById(id: ObjectId | string): Promise<IUserDocument>;
    findWithSkill(filter: FilterQuery<IUserDocument>) : Promise<IUserDocument[]>;
    findClients() : Promise<IUser[]>;
    findByLocation(city ?: string, country ?: string, state ?: string) : Promise<IUser[]>;
    findByIdWithSkills(userId: string) : Promise<IUserDocument | null>;
    findWithSkillsPaginated(
        filter: FilterQuery<IUserDocument>,
        limit: number,
    ): Promise<IUserDocument[]>
    createWithSession(data: Partial<IUserDocument>, session: ClientSession): Promise<IUserDocument>;

    resetSubscriptionState(
        userId: string, limits: { invitesRemaining: number; proposalsRemaining: number }, session: ClientSession
    ): Promise<void>;
    searchForSelect(
        filter: FilterQuery<IUserDocument>,
        page: number,
        limit: number
    ): Promise<Pick<IUserDocument, "_id" | "username" | "email">[]>;
    findByIds(userIds: string[]): Promise<Pick<IUserDocument, "_id" | "username" | "email">[]>;
}