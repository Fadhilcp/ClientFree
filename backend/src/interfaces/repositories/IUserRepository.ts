import { IUser, IUserDocument } from "../../types/user.type.js";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IUserRepository extends IBaseRepository<IUserDocument>{
    findByEmail(email : string) : Promise<IUser | null>;
    findFreelancers() : Promise<IUser[]>;
    findClients() : Promise<IUser[]>;
    findByLocation(city ?: string, country ?: string, state ?: string) : Promise<IUser[]>
}