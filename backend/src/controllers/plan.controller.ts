import { HttpStatus } from 'constants/status.constants';
import { NextFunction, Request, Response } from 'express';
import { IPlanService } from 'services/interface/IPlanService';
import { sendResponse } from 'utils/response.util';

export class PlanController {
    constructor(private service: IPlanService) {}

    async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { userType } = req.query;
        const plans = await this.service.getPlans(userType as string);
        sendResponse(res, HttpStatus.OK, { plans });
      } catch (error) {
        next(error);
      }
    }

    async getPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params;
        const plan = await this.service.getPlanById(id);
        sendResponse(res, HttpStatus.OK, { plan });
      } catch (error) {
        next(error);
      }
    }

    async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const data = req.body;
        const plan = await this.service.createPlan(data);
        sendResponse(res, HttpStatus.CREATED, { plan });
      } catch (error) {
        next(error);
      }
    }

    async updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params;
        const data = req.body

        const plan = await this.service.updatePlan(id, data);
        sendResponse(res, HttpStatus.OK, { plan });
      } catch (error) {
        next(error);
      }
    }

    async deletePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params
        await this.service.deletePlan(id);
        sendResponse(res, HttpStatus.NO_CONTENT, {});
      } catch (error) {
        next(error);
      }
    }
}