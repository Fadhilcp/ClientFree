import { ClientSession, DeleteResult, Document, FilterQuery, ObjectId, PopulateOptions, SortOrder, UpdateQuery, UpdateResult } from "mongoose";


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
  findOne(filter: FilterQuery<TDocument>, options?: { sort?: Record<string, SortOrder> }): Promise<TDocument | null>;
  find(filter: FilterQuery<TDocument>, options?: { sort?: Record<string, SortOrder> }): Promise<TDocument[]>;
  paginate(filter: FilterQuery<TDocument>,options: {
        page?: number;
        limit?: number;
        sort?: Record<string, SortOrder>;
        select?: string | Record<string, 0 | 1>;
        populate?: PopulateOptions | (string | PopulateOptions)[];
    }): Promise<{
        data: TDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>

    //session
    createWithSession(data: Partial<TDocument>, session: ClientSession): Promise<TDocument>;
    
    findOneWithSession(
        filter: FilterQuery<TDocument>,
        session: ClientSession,
        options?: { sort?: Record<string, SortOrder> }
    ): Promise<TDocument | null>;

    findByIdWithSession(id: string, session: ClientSession): Promise<TDocument | null>;
    findWithSession(filter: FilterQuery<TDocument>, session: ClientSession): Promise<TDocument[]>;
}
