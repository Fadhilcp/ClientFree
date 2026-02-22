"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClarificationController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
const user_constants_1 = require("../constants/user.constants");
class ClarificationController {
    constructor(_clarificationService) {
        this._clarificationService = _clarificationService;
    }
    async addMessage(req, res, next) {
        try {
            const { jobId } = req.params;
            const { message } = req.body;
            const senderId = req.user?._id;
            const senderRole = req.user?.role;
            if (!senderId || !senderRole) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            if (![user_constants_1.UserRole.FREELANCER, user_constants_1.UserRole.CLIENT].includes(senderRole)) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Now allowed");
            }
            const newMessage = await this._clarificationService.addMessage(jobId, senderId, senderRole, message);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.CREATED, { message: newMessage });
        }
        catch (error) {
            next(error);
        }
    }
    async getBoard(req, res, next) {
        try {
            const { jobId } = req.params;
            const { board, messages } = await this._clarificationService.getBoard(jobId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { board, messages });
        }
        catch (error) {
            next(error);
        }
    }
    async closeBoard(req, res, next) {
        try {
            const { jobId } = req.params;
            const requesterId = req.user?._id;
            if (!requesterId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const board = await this._clarificationService.closeBoard(jobId, requesterId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { board });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ClarificationController = ClarificationController;
