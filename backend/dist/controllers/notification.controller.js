"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class NotificationController {
    constructor(_notificationService) {
        this._notificationService = _notificationService;
    }
    ;
    async create(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const notification = await this._notificationService.createNotification({
                ...req.body,
                createdBy: userId,
            });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.CREATED, { notification });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { notificationId } = req.params;
            const notification = await this._notificationService.updateNotification(notificationId, req.body);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { notification });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { notificationId } = req.params;
            await this._notificationService.deleteNotification(notificationId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "Notification deleted");
        }
        catch (error) {
            next(error);
        }
    }
    async getMyNotifications(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const notifications = await this._notificationService.getUserNotifications(userId, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { notifications });
        }
        catch (error) {
            next(error);
        }
    }
    async markRead(req, res, next) {
        try {
            const { notificationId } = req.params;
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const notification = await this._notificationService.markAsRead(notificationId, userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { notification });
        }
        catch (error) {
            next(error);
        }
    }
    async countUnread(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const unreadCount = await this._notificationService.countUnread(userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { unreadCount });
        }
        catch (error) {
            next(error);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const { modifiedCount } = await this._notificationService.markAllAsRead(userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { modifiedCount });
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminNotifications(req, res, next) {
        try {
            const search = req.query.search || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const notifications = await this._notificationService.getAdminNotifications(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { notifications });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
