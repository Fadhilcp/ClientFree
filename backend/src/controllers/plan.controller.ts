import { HttpResponse } from 'constants/responseMessage.constant';
import { HttpStatus } from 'constants/status.constants';
import { NextFunction, Request, Response } from 'express';
import { IPlanService } from 'services/interface/IPlanService';
import { createHttpError } from 'utils/httpError.util';
import { sendResponse } from 'utils/response.util';

export class PlanController {
    constructor(private _service: IPlanService) {}

    async getActivePlans(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { userType } = req.query;
        const plans = await this._service.getActive(userType as string);
        sendResponse(res, HttpStatus.OK, { plans });
      } catch (error) {
        next(error);
      }
    }

    async getAllPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const search = req.query.search as string || '';
        const status = req.query.status as string || '';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const plans = await this._service.getPlans(search, status, page, limit);
        
        sendResponse(res, HttpStatus.OK, { plans });
      } catch (error) {
        next(error);
      }
    }

    async getPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params;
        const role = req.user?.role;
        if(!role){
          throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.ROLE_NOT_FOUND);
        }
        const plan = await this._service.getPlanById(id, role);
        sendResponse(res, HttpStatus.OK, { plan });
      } catch (error) {
        next(error);
      }
    }

    async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const data = req.body;
        const plan = await this._service.createPlan(data);
        sendResponse(res, HttpStatus.CREATED, { plan });
      } catch (error) {
        next(error);
      }
    }

    async updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params;
        const data = req.body

        const plan = await this._service.updatePlan(id, data);
        sendResponse(res, HttpStatus.OK, { plan });
      } catch (error) {
        next(error);
      }
    }

    async deletePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params
        await this._service.deletePlan(id);
        sendResponse(res, HttpStatus.NO_CONTENT, {});
      } catch (error) {
        next(error);
      }
    }
}