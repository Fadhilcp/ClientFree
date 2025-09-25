import { baseRepository } from "./base.repository.js";
import { IUser } from "../types/user.type.js";
import userModel from "./../models/user.model.js"

 export class userRepository extends baseRepository<IUser>{
    constructor(){
        super(userModel);
    }

    async findByEmail(email : string) : Promise<IUser | null>{
        return this.model.findOne({ email });
    }

    async findFreelancers() : Promise<IUser[]>{
        return this.model.find({ role : "freelancer" });
    }

    async findClients() : Promise<IUser[]>{
        return this.model.find({ role : "client" });
    }

    async findByLocation(city ?: string, country ?: string, state ?: string) : Promise<IUser[]>{

        const filter : Record<string, any> = {};
        
        if(city) filter["location.city"] = city;
        if(country) filter["location.country"] = country;
        if(state) filter["location.state"] = state;

        return this.model.find(filter)
    }

    
 }