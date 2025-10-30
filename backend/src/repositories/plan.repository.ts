import { IPlanDocument } from "types/plan.type";
import { BaseRepository } from "./base.repository";
import { IPlanRepository } from "./interfaces/IPlanRepository";
import planSchema from "../models/plan.model";

export class PlanRepository 
    extends BaseRepository<IPlanDocument> 
        implements IPlanRepository {

        constructor(){
            super(planSchema)
        }
}