import { IJobDocument } from "types/job.type";
import { IJobRepository } from "./interfaces/IJobRepository";
import { BaseRepository } from "./base.repository";
import jobModel from "../models/job.model";
import { FilterQuery } from "mongoose";

export class JobRepository 
   extends BaseRepository<IJobDocument>
      implements IJobRepository {
        
    constructor(){
        super(jobModel);
    }

    async findWithSkills(filter: FilterQuery<IJobDocument>): Promise<IJobDocument[]> {
        return this.model.find(filter).populate("skills", "name _id");
    }
}