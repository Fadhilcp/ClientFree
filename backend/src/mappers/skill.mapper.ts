import { SkillDto } from "../dtos/skill.dto";
import { ISkillDocument } from "../types/skill.type";

export function mapSkill(skill: ISkillDocument): SkillDto {
    return {
        id: skill._id.toString(),
        name: skill.name,
        category: skill.category,
        status: skill.status,
    };
}