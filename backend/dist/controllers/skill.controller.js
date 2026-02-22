"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class SkillController {
    constructor(_skillService) {
        this._skillService = _skillService;
    }
    ;
    async create(req, res, next) {
        try {
            const skillData = req.body;
            const skill = await this._skillService.createSkill(skillData);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { skill });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const category = typeof req.query.category === 'string' ? req.query.category : '';
            const status = typeof req.query.status === 'string' ? req.query.status : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {};
            if (category)
                filters.category = category;
            if (status)
                filters.status = status;
            const skills = await this._skillService.getAllSkills(filters, search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { skills });
        }
        catch (error) {
            next(error);
        }
    }
    async getActive(req, res, next) {
        try {
            const skills = await this._skillService.getActiveSkills();
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { skills });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const skillId = req.params.id;
            const skillData = req.body;
            if (!skillId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.SKILL_ID_REQUIRED);
            const updated = await this._skillService.updateSkill(skillId, skillData);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { updated });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const skillId = req.params.id;
            if (!skillId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.SKILL_ID_REQUIRED);
            const result = await this._skillService.deleteSkill(skillId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SkillController = SkillController;
