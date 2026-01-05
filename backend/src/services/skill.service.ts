import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { ISkillRepository } from "../repositories/interfaces/ISkillRepository";
import { ISkillService } from "../services/interface/ISkillService";
import { DeleteResult, FilterQuery } from "mongoose";
import { ISkill, ISkillDocument } from "../types/skill.type";
import { createHttpError } from "../utils/httpError.util";
import { mapSkill } from "../mappers/skill.mapper";
import { SkillDto } from "../dtos/skill.dto";
import { PaginatedResult } from "../types/pagination";
import { normalizeText } from "../utils/normalizeText";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";


export class SkillService implements ISkillService {
    constructor(private _skillRepository : ISkillRepository, private _userRepository: IUserRepository){};

    async createSkill(skillData: ISkill): Promise<ISkillDocument> {

        const normalizedName = normalizeText(skillData.name);
        const existing = await this._skillRepository.findOne({ normalizedName });

        if (existing) {
            throw createHttpError(HttpStatus.CONFLICT, `Skill "${skillData.name}" already exists`);
        }

        return this._skillRepository.create({
            ...skillData,
            normalizedName,
        });
    }

    async getAllSkills(filter: FilterQuery<ISkillDocument>, search: string, page=1, limit=10): Promise<PaginatedResult<SkillDto>> {

        if(search){
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ]
        }
        const result = await this._skillRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(mapSkill)
        };
    }

    async getActiveSkills(): Promise<SkillDto[]> {
        const skills = await this._skillRepository.find({ status: 'active' });
        return skills.map(mapSkill);
    }

    async getSkillsByCategory(category: string): Promise<ISkillDocument[]> {
        return this._skillRepository.find({ category, status: 'active' });
    }

    async updateSkill(id: string, skillData: ISkill): Promise<ISkillDocument> {

        const normalizedName = normalizeText(skillData.name);
        const existing = await this._skillRepository.findOne({ normalizedName, _id: { $ne: id } });

        if (existing) {
            throw createHttpError(HttpStatus.CONFLICT, `Skill "${skillData.name}" already exists`);
        }
        const updated = await this._skillRepository.findByIdAndUpdate(id, {...skillData, normalizedName});

        if(!updated) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SKILL_NOT_FOUND);
        }
        return updated;
    }

    async deleteSkill(skillId: string): Promise<DeleteResult> {
        const result = await this._skillRepository.deleteOne({ _id: skillId });

        if(result.deletedCount === 0) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SKILL_NOT_FOUND);
        }
        // to remove skill id from the user document
        await this._userRepository.updateMany({ skills: skillId }, { $pull: { skills: skillId }});

        return result;
    }
}