"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class PlanController {
    constructor(_planService) {
        this._planService = _planService;
    }
    async getActivePlans(req, res, next) {
        try {
            const { userType } = req.query;
            const plans = await this._planService.getActive(userType);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { plans });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllPlans(req, res, next) {
        try {
            const search = req.query.search || '';
            const status = req.query.status || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const plans = await this._planService.getPlans(search, status, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { plans });
        }
        catch (error) {
            next(error);
        }
    }
    async getPlan(req, res, next) {
        try {
            const { id } = req.params;
            const role = req.user?.role;
            if (!role) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.ROLE_NOT_FOUND);
            }
            const plan = await this._planService.getPlanById(id, role);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { plan });
        }
        catch (error) {
            next(error);
        }
    }
    async createPlan(req, res, next) {
        try {
            const data = req.body;
            const plan = await this._planService.createPlan(data);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.CREATED, { plan });
        }
        catch (error) {
            next(error);
        }
    }
    async updatePlan(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const plan = await this._planService.updatePlan(id, data);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { plan });
        }
        catch (error) {
            next(error);
        }
    }
    async deletePlan(req, res, next) {
        try {
            const { id } = req.params;
            await this._planService.deletePlan(id);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.NO_CONTENT, {});
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PlanController = PlanController;
