import { SkillDto } from "dtos/skill.dto";
import { DeleteResult, FilterQuery } from "mongoose";
import { PaginatedResult } from "types/pagination";
import { ISkill, ISkillDocument } from "types/skill.type";


export interface ISkillService {
    createSkill(skillData: ISkill): Promise<ISkillDocument>;
    getAllSkills(filter: FilterQuery<ISkillDocument>, search: string, page:number, limit: number): Promise<PaginatedResult<SkillDto>>;
    getActiveSkills(): Promise<SkillDto[]>;
    getSkillsByCategory(category: string): Promise<ISkillDocument[]>;
    updateSkill(skillId: string, skillData:Partial<ISkill>): Promise<ISkillDocument>;
    deleteSkill(skillId: string): Promise<DeleteResult>;
}