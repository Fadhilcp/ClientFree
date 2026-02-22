"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOnService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const addOns_mapper_1 = __importDefault(require("../mappers/addOns.mapper"));
class AddOnService {
    constructor(_addOnRepository) {
        this._addOnRepository = _addOnRepository;
    }
    async createAddOn(addOnData) {
        const exists = await this._addOnRepository.findOne({ Key: addOnData.key });
        if (exists)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.ADD_ON_KEY_EXISTS);
        const newAddOn = await this._addOnRepository.create(addOnData);
        return addOns_mapper_1.default.toMap(newAddOn);
    }
    async updateAddOn(addOnId, addOnData) {
        const addOn = await this._addOnRepository.findByIdAndUpdate(addOnId, addOnData);
        if (!addOn)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.ADD_ON_NOT_FOUND);
        return addOns_mapper_1.default.toMap(addOn);
    }
    async toggleActive(addOnId) {
        const addOn = await this._addOnRepository.findById(addOnId);
        if (!addOn)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.ADD_ON_NOT_FOUND);
        addOn.isActive = !addOn.isActive;
        addOn.updatedAt = new Date();
        addOn.save();
        return addOns_mapper_1.default.toMap(addOn);
    }
    async getAll(search, page, limit) {
        const filter = {};
        if (search) {
            filter.$or = [
                { key: { $regex: search, $options: "i" } },
                { displayName: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }
        const result = await this._addOnRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });
        return {
            ...result,
            data: addOns_mapper_1.default.toList(result.data)
        };
    }
    async getById(addOnId) {
        const addOn = await this._addOnRepository.findById(addOnId);
        if (!addOn)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.ADD_ON_NOT_FOUND);
        return addOns_mapper_1.default.toMap(addOn);
    }
    async deleteAddOn(addOnId) {
        const result = await this._addOnRepository.deleteOne({ _id: addOnId });
        return result ? true : false;
    }
    async getActive() {
        const addOns = await this._addOnRepository.find({ isActive: true }, { sort: { sortOrder: 1 } });
        return addOns_mapper_1.default.toList(addOns);
    }
}
exports.AddOnService = AddOnService;
