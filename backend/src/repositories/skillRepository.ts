import skillModel from "models/skill.model";
import { BaseRepository } from "./base.repository";
import { ISkillDocument } from "types/skill.type";
import { ISkillRepository } from "./interfaces/ISkillRepository";

export class SkillRepository 
   extends BaseRepository<ISkillDocument>
      implements ISkillRepository {
        
    constructor(){
        super(skillModel);
    }
}