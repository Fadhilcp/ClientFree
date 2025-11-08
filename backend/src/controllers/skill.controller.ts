import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { ISkillService } from "services/interface/ISkillService";
import { ISkill } from "types/skill.type";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";



export class SkillController {
    constructor(private service: ISkillService) {};

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: ISkill = req.body;
            console.log("🚀 ~ SkillController ~ create ~ data:", data)
            const skill = await this.service.createSkill(data);

            sendResponse(res, HttpStatus.OK, { skill });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = req.query.search as string || '';
            const { category, status } = req.query;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const filters: any = {};
            if (category) filters.category = category;
            if (status) filters.status = status;

            const skills = await this.service.getAllSkills(filters, search, page, limit);
            sendResponse(res, HttpStatus.OK, { skills });
        } catch (error) {
            next(error);
        }
    }

    async getActive(req: Request, res: Response, next: NextFunction) {
        try {
            const skills = await this.service.getActiveSkills();
            sendResponse(res, HttpStatus.OK, { skills });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const skillId = req.params.id
            const data = req.body;

            if(!skillId) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.SKILL_ID_REQUIRED)

            const updated = await this.service.updateSkill(skillId, data);
            sendResponse(res, HttpStatus.OK, { updated });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const skillId = req.params.id;

            if(!skillId) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.SKILL_ID_REQUIRED)

            const result = await this.service.deleteSkill(skillId);
            sendResponse(res, HttpStatus.OK, { result });
        } catch (error) {
            next(error);
        }
    }
}