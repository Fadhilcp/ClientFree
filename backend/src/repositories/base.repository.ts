
import { 
    Model, 
    Document,
    FilterQuery,
    UpdateQuery,
    UpdateResult,
    DeleteResult,
    ObjectId
} from "mongoose";

export class BaseRepository<T extends Document>{

    constructor(protected model : Model<T>){}

    async findById(id : ObjectId) : Promise<T | null>{
        return this.model.findById(id);
    }

    async findAll() : Promise<T[]>{
        return this.model.find();
    }

    async create(data : Partial<T>) : Promise<T> {
        return this.model.create(data);
    }

    async findByIdAndUpdate(id : ObjectId , data : Partial<T>) : Promise<T | null>{
        return this.model.findByIdAndUpdate(id , data , { upsert : true , new : true});
    }

    async updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<UpdateResult> {
        return this.model.updateMany(filter, data);
    }
    
    async updateOne(filter : FilterQuery<T>, data : UpdateQuery<T>) : Promise<UpdateResult>{
        return this.model.updateOne(filter, data);
    }
    
    async delete(id : ObjectId) : Promise<T | null>{
        return this.model.findByIdAndDelete(id);
    }
    
    async deleteMany(filter: FilterQuery<T>): Promise<DeleteResult> {
        return this.model.deleteMany(filter);
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