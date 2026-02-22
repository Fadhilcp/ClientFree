"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillService = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const skill_mapper_1 = require("../mappers/skill.mapper");
const normalizeText_1 = require("../utils/normalizeText");
class SkillService {
    constructor(_skillRepository, _userRepository) {
        this._skillRepository = _skillRepository;
        this._userRepository = _userRepository;
    }
    ;
    async createSkill(skillData) {
        const normalizedName = (0, normalizeText_1.normalizeText)(skillData.name);
        const existing = await this._skillRepository.findOne({ normalizedName });
        if (existing) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, `Skill "${skillData.name}" already exists`);
        }
        return this._skillRepository.create({
            ...skillData,
            normalizedName,
        });
    }
    async getAllSkills(filter, search, page = 1, limit = 10) {
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }
        const result = await this._skillRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: result.data.map(skill_mapper_1.mapSkill)
        };
    }
    async getActiveSkills() {
        const skills = await this._skillRepository.find({ status: 'active' });
        return skills.map(skill_mapper_1.mapSkill);
    }
    async getSkillsByCategory(category) {
        return this._skillRepository.find({ category, status: 'active' });
    }
    async updateSkill(id, skillData) {
        const normalizedName = (0, normalizeText_1.normalizeText)(skillData.name);
        const existing = await this._skillRepository.findOne({ normalizedName, _id: { $ne: id } });
        if (existing) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, `Skill "${skillData.name}" already exists`);
        }
        const updated = await this._skillRepository.findByIdAndUpdate(id, { ...skillData, normalizedName });
        if (!updated) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.SKILL_NOT_FOUND);
        }
        return updated;
    }
    async deleteSkill(skillId) {
        const result = await this._skillRepository.deleteOne({ _id: skillId });
        if (result.deletedCount === 0) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.SKILL_NOT_FOUND);
        }
        // to remove skill id from the user document
        await this._userRepository.updateMany({ skills: skillId }, { $pull: { skills: skillId } });
        return result;
    }
}
exports.SkillService = SkillService;
