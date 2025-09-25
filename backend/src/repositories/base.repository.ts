
import { 
    Model, 
    Document,
    Types,
    FilterQuery,
    UpdateQuery,
    UpdateResult,
    DeleteResult
} from "mongoose";

export abstract class baseRepository<T extends Document>{

    constructor(protected model : Model<T>){}

    async findById(id : Types.ObjectId) : Promise<T | null>{
        return this.model.findById(id);
    }

    async findAll() : Promise<T[]>{
        return this.model.find();
    }

    async create(data : Partial<T>) : Promise<T> {
        return this.model.create(data);
    }

    async findByIdAndUpdate(id : Types.ObjectId , data : Partial<T>) : Promise<T | null>{
        return this.model.findByIdAndUpdate(id , data , { upsert : true , new : true});
    } 

    async updateOne(filter : FilterQuery<T>, data : UpdateQuery<T>) : Promise<UpdateResult>{
        return this.model.updateOne(filter, data);
    }

    async delete(id : Types.ObjectId) : Promise<T | null>{
        return this.model.findByIdAndDelete(id);
    }

    async deleteOne(filter : FilterQuery<T>) : Promise<DeleteResult>{
        return this.model.deleteOne(filter);
    }

    async findOne(filter : FilterQuery<T>) : Promise<T | null>{
        return this.model.findOne(filter);
    }

    async find(filter : FilterQuery<T>) : Promise<T[]>{
        return this.model.find(filter)
    }
}