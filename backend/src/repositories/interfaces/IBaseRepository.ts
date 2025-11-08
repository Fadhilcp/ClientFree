import { DeleteResult, Document, FilterQuery, ObjectId, UpdateQuery, UpdateResult } from "mongoose";


export interface IBaseRepository<TDocument extends Document> {
  findById(id: ObjectId | string): Promise<TDocument | null>;
  findAll(): Promise<TDocument[]>;
  create(data: Partial<TDocument>): Promise<TDocument>;
  findByIdAndUpdate(id: ObjectId | string, data: Partial<TDocument>): Promise<TDocument | null>;
  updateOne(filter: FilterQuery<TDocument>, data: UpdateQuery<TDocument>): Promise<TDocument | null>;
  updateMany(filter: FilterQuery<TDocument>, data: UpdateQuery<TDocument>): Promise<UpdateResult>;
  delete(id: ObjectId | string): Promise<TDocument | null>;
  deleteMany(filter: FilterQuery<TDocument>): Promise<DeleteResult>;
  deleteOne(filter: FilterQuery<TDocument>): Promise<DeleteResult>;
  findOne(filter: FilterQuery<TDocument>, options?: { sort?: any }): Promise<TDocument | null>;
  find(filter: FilterQuery<TDocument>): Promise<TDocument[]>;
  paginate(filter: FilterQuery<TDocument>,options: {
        page?: number;
        limit?: number;
        sort?: any;
        select?: any;
        populate?: any;
    }): Promise<{
        data: TDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>
}
