import { DeleteResult, Document, FilterQuery, ObjectId, UpdateQuery, UpdateResult } from "mongoose";


export interface IBaseRepository<TDocument extends Document> {
  findById(id: ObjectId): Promise<TDocument | null>;
  findAll(): Promise<TDocument[]>;
  create(data: Partial<TDocument>): Promise<TDocument>;
  findByIdAndUpdate(id: ObjectId, data: Partial<TDocument>): Promise<TDocument | null>;
  updateOne(filter: FilterQuery<TDocument>, data: UpdateQuery<TDocument>): Promise<UpdateResult>;
  delete(id: ObjectId): Promise<TDocument | null>;
  deleteOne(filter: FilterQuery<TDocument>): Promise<DeleteResult>;
  findOne(filter: FilterQuery<TDocument>): Promise<TDocument | null>;
  find(filter: FilterQuery<TDocument>): Promise<TDocument[]>;
}
