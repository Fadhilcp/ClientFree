import { IUser } from "../../types/user.type.js";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IUserRepository extends IBaseRepository<IUser>{
    findByEmail(email : string) : Promise<IUser | null>;
    findFreelancers() : Promise<IUser[]>;
    findClients() : Promise<IUser[]>;
    findByLocation(city ?: string, country ?: string, state ?: string) : Promise<IUser[]>
}