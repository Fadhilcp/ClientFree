
import { 
    Model, 
    Document,
    FilterQuery,
    UpdateQuery,
    UpdateResult,
    DeleteResult,
    ObjectId
} from "mongoose";
import { IBaseRepository } from "./interfaces/IBaseRepository";

export class BaseRepository<T extends Document> implements IBaseRepository<T>{

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

    async findOne(filter : FilterQuery<T>, options?: { sort?: any }) : Promise<T | null>{
        let query = this.model.findOne(filter);
        if(options?.sort) query = query.sort(options.sort);
        return query;
    }

    async find(filter : FilterQuery<T>) : Promise<T[]>{
        return this.model.find(filter)
    }

    async count() {
        return this.model.countDocuments();
    }

    async paginate(filter: FilterQuery<T> = {},options: {
        page?: number;
        limit?: number;
        sort?: any;
        select?: any;
        populate?: any;
    } = {}): Promise<{
        data: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        let query = this.model.find(filter).skip(skip).limit(limit);

        if (options.sort) query = query.sort(options.sort);
        if (options.select) query = query.select(options.select);
        if (options.populate) query = query.populate(options.populate);

        const [data, total] = await Promise.all([
            query.exec(),
            this.model.countDocuments(filter)
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}