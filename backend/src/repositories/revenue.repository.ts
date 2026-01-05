import { IRevenueDocument } from "../types/revenue.type";
import { BaseRepository } from "./base.repository";
import { IRevenueRepository } from "./interfaces/IRevenueRepository";
import revenueModel from "../models/revenue.model";


export class RevenueRepository 
   extends BaseRepository<IRevenueDocument>
      implements  IRevenueRepository {
        
    constructor(){
        super(revenueModel);
    }
}