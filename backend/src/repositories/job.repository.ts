import { IJobDocument } from "types/job.type";
import { IJobRepository } from "./interfaces/IJobRepository";
import { BaseRepository } from "./base.repository";
import jobModel from "../models/job.model";

export class JobRepository 
   extends BaseRepository<IJobDocument>
      implements IJobRepository {
        
    constructor(){
        super(jobModel);
    }
}