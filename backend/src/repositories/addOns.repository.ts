import { IAddOnDocument } from "types/addOns.type";
import { IAddOnRepository } from "./interfaces/IAddOnsRepository";
import { BaseRepository } from "./base.repository";
import addOnsModel from "models/addOns.model";

export class AddOnRepository 
   extends BaseRepository<IAddOnDocument>
      implements IAddOnRepository {
        
    constructor(){
        super(addOnsModel);
    }
}