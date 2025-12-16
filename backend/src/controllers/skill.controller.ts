import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { ISkillService } from "services/interface/ISkillService";
import { ISkill } from "types/skill.type";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";



export class SkillController {
    constructor(private _skillService: ISkillService) {};

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const skillData: ISkill = req.body;
            const skill = await this._skillService.createSkill(skillData);

            sendResponse(res, HttpStatus.OK, { skill });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const category = typeof req.query.category === 'string' ? req.query.category : '';
            const status = typeof req.query.status === 'string' ? req.query.status : '';
            
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const filters: { category?: string, status?: string} = {};
            if (category) filters.category = category;
            if (status) filters.status = status;
            const skills = await this._skillService.getAllSkills(filters, search, page, limit);
            sendResponse(res, HttpStatus.OK, { skills });
        } catch (error) {
            next(error);
        }
    }

    async getActive(req: Request, res: Response, next: NextFunction) {
        try {
            const skills = await this._skillService.getActiveSkills();
            sendResponse(res, HttpStatus.OK, { skills });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const skillId = req.params.id
            const skillData = req.body;

            if(!skillId) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.SKILL_ID_REQUIRED)

            const updated = await this._skillService.updateSkill(skillId, skillData);
            sendResponse(res, HttpStatus.OK, { updated });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const skillId = req.params.id;

            if(!skillId) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.SKILL_ID_REQUIRED)

            const result = await this._skillService.deleteSkill(skillId);
            sendResponse(res, HttpStatus.OK, { result });
        } catch (error) {
            next(error);
        }
    }
}