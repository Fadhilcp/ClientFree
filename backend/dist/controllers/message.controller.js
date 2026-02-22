"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class MessageController {
    constructor(_messageService) {
        this._messageService = _messageService;
    }
    ;
    async sendMessage(req, res, next) {
        try {
            const senderId = req.user?._id;
            if (!senderId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const { chatId } = req.params;
            const { type, content, callDetails } = req.body;
            const file = req.file;
            const message = await this._messageService.sendMessage(chatId, senderId, type, content, file, callDetails);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { message });
        }
        catch (error) {
            next(error);
        }
    }
    async getChatMessages(req, res, next) {
        try {
            const userId = req.user?._id;
            const { chatId } = req.params;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const messages = await this._messageService.getChatMessages(chatId, userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { messages });
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const userId = req.user?._id;
            const { chatId } = req.params;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            await this._messageService.markMessageAsRead(chatId, userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {});
        }
        catch (error) {
            next(error);
        }
    }
    async getFileSignedUrl(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const { messageId } = req.params;
            const signedUrl = await this._messageService.getFileSignedUrl(messageId, userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { url: signedUrl });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMessage(req, res, next) {
        try {
            const { messageId } = req.params;
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const message = await this._messageService.deleteMessage(messageId, userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { message });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MessageController = MessageController;
