import { skillDto } from "dtos/skill.dto";

export function mapSkill(skill: any): skillDto {
    return {
        id: skill._id,
        name: skill.name,
        category: skill.category,
        status: skill.status,
    };
}