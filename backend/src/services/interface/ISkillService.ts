import { skillDto } from "dtos/skill.dto";
import { DeleteResult } from "mongoose";
import { ISkill, ISkillDocument } from "types/skill.type";



export interface ISkillService {
    createSkill(data: ISkill): Promise<ISkillDocument>;
    getAllSkills(filter:{}): Promise<skillDto[]>;
    getSkillsByCategory(category: string): Promise<ISkillDocument[]>;
    updateSkill(id: string, data:Partial<ISkill>): Promise<ISkillDocument>;
    deleteSkill(id: string): Promise<DeleteResult>;
}