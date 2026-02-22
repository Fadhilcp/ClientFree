"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class ChatController {
    constructor(_chatService) {
        this._chatService = _chatService;
    }
    ;
    async getOrCreateChat(req, res, next) {
        try {
            const initiatorId = req.user?._id;
            const { receiverId, jobId } = req.body;
            if (!initiatorId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const chat = await this._chatService.getOrCreateChat(initiatorId, receiverId, jobId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { chat });
        }
        catch (error) {
            next(error);
        }
    }
    async getMyChats(req, res, next) {
        try {
            const userId = req.user?._id;
            const search = req.query.search || "";
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const chats = await this._chatService.getUserChats(userId, search);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { chats });
        }
        catch (error) {
            next(error);
        }
    }
    async blockChat(req, res, next) {
        try {
            const { chatId } = req.params;
            const { reason } = req.body;
            const chat = await this._chatService.blockChat(chatId, reason);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { chat });
        }
        catch (error) {
            next(error);
        }
    }
    async updateChatBlockStatus(req, res, next) {
        try {
            const { chatId } = req.params;
            const chat = await this._chatService.updateBlockStatus(chatId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { chat });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ChatController = ChatController;
