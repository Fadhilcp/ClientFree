"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddonController = void 0;
const status_constants_1 = require("../constants/status.constants");
const response_util_1 = require("../utils/response.util");
class AddonController {
    constructor(_addOnService) {
        this._addOnService = _addOnService;
    }
    async create(req, res, next) {
        try {
            const addOnData = req.body;
            const addOn = await this._addOnService.createAddOn(addOnData);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { addOn });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { addOnId } = req.params;
            const addOnData = req.body;
            const addOn = await this._addOnService.updateAddOn(addOnId, addOnData);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { addOn });
        }
        catch (error) {
            next(error);
        }
    }
    async toggleActive(req, res, next) {
        try {
            const { addOnId } = req.params;
            const addOns = await this._addOnService.toggleActive(addOnId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { addOns });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const addOns = await this._addOnService.getAll(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { addOns });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { addOnId } = req.params;
            const addOn = await this._addOnService.getById(addOnId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { addOn });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { addOnId } = req.params;
            const deleted = await this._addOnService.deleteAddOn(addOnId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "AddOn deleted successfully", deleted);
        }
        catch (error) {
            next(error);
        }
    }
    async getActive(req, res, next) {
        try {
            const addOns = await this._addOnService.getActive();
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { addOns });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AddonController = AddonController;
