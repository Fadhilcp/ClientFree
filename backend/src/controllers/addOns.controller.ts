import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IAddOnService } from "services/interface/IAddOnsService";
import { sendResponse } from "utils/response.util";

export class AddonController {
    constructor(private _addOnService: IAddOnService){}


    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const addOnData = req.body;
            const addOn = await this._addOnService.createAddOn(addOnData);

            sendResponse(res, HttpStatus.OK, { addOn });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { addOnId } = req.params;
            const addOnData = req.body;

            const addOn = await this._addOnService.updateAddOn(addOnId, addOnData);

            sendResponse(res, HttpStatus.OK, { addOn });
        } catch (error) {
            next(error);
        }
    }

    async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const addOns = await this._addOnService.getAll();

            sendResponse(res, HttpStatus.OK, { addOns });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const addOns = await this._addOnService.getAll();

            sendResponse(res, HttpStatus.OK, { addOns });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { addOnId } = req.params;
            const addOn = await this._addOnService.getById(addOnId);

            sendResponse(res, HttpStatus.OK, { addOn });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { addOnId } = req.params;
            const deleted: boolean = await this._addOnService.deleteAddOn(addOnId);

            sendResponse(res, HttpStatus.OK, {}, "AddOn deleted successfully", deleted)
        } catch (error) {
            next(error);
        }
    }
}