import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { ISkillRepository } from "repositories/interfaces/ISkillRepository";
import { ISkillService } from "services/interface/ISkillService";
import { DeleteResult, FilterQuery } from "mongoose";
import { ISkill, ISkillDocument } from "types/skill.type";
import { createHttpError } from "utils/httpError.util";
import { mapSkill } from "mappers/skill.mapper";
import { SkillDto } from "dtos/skill.dto";
import { PaginatedResult } from "types/pagination";


export class SkillService implements ISkillService {
    constructor(private skillRepository : ISkillRepository){};

    async createSkill(data: ISkill): Promise<ISkillDocument> {

        const existing = await this.skillRepository.findOne({
            name: { $regex: `^${data.name}$`, $options: "i" }
        });

        if (existing) {
            throw createHttpError(HttpStatus.CONFLICT, `Skill "${data.name}" already exists`);
        }
        return this.skillRepository.create(data);
    }

    async getAllSkills(filter: FilterQuery<ISkillDocument>, page=1, limit=10): Promise<PaginatedResult<SkillDto>> {
        const result = await this.skillRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(mapSkill)
        };
    }

    async getActiveSkills(): Promise<SkillDto[]> {
        const skills = await this.skillRepository.find({ status: 'active' });
        return skills.map(mapSkill);
    }

    async getSkillsByCategory(category: string): Promise<ISkillDocument[]> {
        return this.skillRepository.find({ category, status: 'active' });
    }

    async updateSkill(id: string, data: Partial<ISkill>): Promise<ISkillDocument> {
        const updated = await this.skillRepository.findByIdAndUpdate(id, data);

        if(!updated) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SKILL_NOT_FOUND);
        }
        return updated;
    }

    async deleteSkill(id: string): Promise<DeleteResult> {
        const result = await this.skillRepository.deleteOne({ _id: id });

        if(!result) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SKILL_NOT_FOUND);
        }
        return result;
    }
}