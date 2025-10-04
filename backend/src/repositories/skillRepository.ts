import skillModel from "models/skill.model";
import { BaseRepository } from "./base.repository";
import { ISkillDocument } from "types/skill.type";

export class SkillRepository extends BaseRepository<ISkillDocument>{
    constructor(){
        super(skillModel);
    }
}