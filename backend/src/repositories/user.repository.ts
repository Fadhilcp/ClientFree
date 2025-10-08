import { BaseRepository } from "./base.repository";
import { IUserDocument } from "../types/user.type";
import userModel from "./../models/user.model"
import { IUserRepository } from "./interfaces/IUserRepository";

export class UserRepository 
   extends BaseRepository<IUserDocument>
      implements IUserRepository {
        
    constructor(){
        super(userModel);
    }

    async findByEmail(email : string) : Promise<IUserDocument | null>{
        return this.model.findOne({ email });
    }

    async findFreelancers() : Promise<IUserDocument[]>{
        return this.model.find({ role : "freelancer" });
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
    
 }