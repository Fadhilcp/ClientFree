import { SkillDto } from "dtos/skill.dto";

export function mapSkill(skill: any): SkillDto {
    return {
        _id: skill._id,
        name: skill.name,
        category: skill.category,
        status: skill.status,
    };
}