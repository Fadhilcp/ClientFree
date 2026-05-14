"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const response_util_1 = require("../utils/response.util");
class AiController {
    constructor(_aiService) {
        this._aiService = _aiService;
    }
    async getJobSuggestions(req, res, next) {
        try {
            const { title } = req.body;
            if (!title) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Title is required");
            }
            const suggestions = await this._aiService.generateJobSuggestion(title);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { suggestions });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AiController = AiController;
